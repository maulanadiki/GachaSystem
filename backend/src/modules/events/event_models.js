const pool = require("../../config/connection");
const crypto = require("crypto")
const { InsertEvents, UpdateEvent } = require("../../libs/core_functions");

const COST_PER_ROLL = 10
const MAX_ROLLS_PER_REQUEST = 10 // anti-abuse cap on batch size

class Events_models{
    static async InsertEvent(data){
        const result = await InsertEvents("EVENTS",data)
        return result
    }
    static async InsertItems(data){
        const result = await InsertEvents("gacha_items",data)
        return result
    }
    static async UpdateEvents(data,id){
        const result = await UpdateEvent("EVENTS",data,id)
    }
    static async GetCoins(username){
        const query = `SELECT coins FROM users WHERE username = $1 LIMIT 1`;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }
    static async getItems(){
        const query = `SELECT a.id,a.event_id, b.event_name, a.item_name, a.rarity, a.drop_rate,a.images,a.description
                   FROM gacha_items a
                   LEFT JOIN events b ON a.event_id = b.id
                   ORDER BY a.id desc
                   `;
        const result = await pool.query(query);
        return result.rows;
    }
    static async updateStatus(data){
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            if (data.active) {
                await client.query("UPDATE events SET active = false");
            }

            const query = `UPDATE events SET active = $1 WHERE id = $2 RETURNING *`;
            const result = await client.query(query, [data.active, data.id]);

            await client.query("COMMIT");
            return result.rows;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
    static async getEvents(){
        // MAX(CASE WHEN rarity = 'Legendaris' THEN drop_rate END)*100 AS Legendaris,
        //             MAX(CASE WHEN rarity = 'Langka' THEN drop_rate END)*100 AS langka,
        //             MAX(CASE WHEN rarity = 'Biasa' THEN drop_rate END)*100 AS biasa,
        //             MAX(CASE WHEN rarity = 'Legendaris' THEN drop_rate ELSE 0 END)
        //             + MAX(CASE WHEN rarity = 'Langka' THEN drop_rate ELSE 0 END)
        //             + MAX(CASE WHEN rarity = 'Biasa' THEN drop_rate ELSE 0 END) AS total_drop_rate
const query =`SELECT
                a.id,
                a.event_name,
                a.description,
                TO_CHAR(a.start_date, 'DD Mon YYYY') AS start,
                TO_CHAR(a.end_date, 'DD Mon YYYY') AS end,
                a.images,
                a.active,
                COALESCE(b.total_drop_rate, 0) AS drop_rate,
                b.Legendaris,
                b.langka,
                b.biasa
            FROM events a
            LEFT JOIN (
                SELECT
                    event_id,
                    SUM(CASE WHEN rarity = 'Legendaris' THEN drop_rate END) AS Legendaris,
                    SUM(CASE WHEN rarity = 'Langka' THEN drop_rate END) AS langka,
                    SUM(CASE WHEN rarity = 'Biasa' THEN drop_rate END) AS biasa,
                    sum(drop_rate) AS total_drop_rate
                FROM gacha_items
                GROUP BY event_id
            ) b ON b.event_id = a.id`;
        const result = await pool.query(query);
        return result.rows;
    }

    static secureRandomFloat(){
        const RANGE = 1_000_000_000
        return crypto.randomInt(0, RANGE) / RANGE
    }

    static weightedRandomPick(items){
        const totalWeight = items.reduce((sum, it) => sum + Number(it.drop_rate), 0)
        if(totalWeight <= 0){
            throw new Error("Invalid item pool: drop_rate sums to zero")
        }
        const roll = Events_models.secureRandomFloat() * totalWeight
        let cumulative = 0
        for(const item of items){
            cumulative += Number(item.drop_rate)
            if(roll < cumulative) return item
        }
        return items[items.length - 1]
    }

    static async rollGacha(username, times){
        if(!Number.isInteger(times) || times <= 0){
            throw new Error("times must be a positive integer")
        }
        if(times > MAX_ROLLS_PER_REQUEST){
            throw new Error(`times cannot exceed ${MAX_ROLLS_PER_REQUEST} per request`)
        }

        const cost = COST_PER_ROLL * times
        const client = await pool.connect()

        try{
            await client.query("BEGIN")
            await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [username])

            const userResult = await client.query(
                "SELECT id,username, coins FROM users WHERE username = $1 FOR UPDATE",
                [username]
            )

            if(userResult.rows.length === 0){
                throw new Error("User not found")
            }
            const userId = userResult.rows[0].id
            const coins = Number(userResult.rows[0].coins)

            if(coins < cost){
                throw new Error("Insufficient balance")
            }

            const itemsResult = await client.query(
                `SELECT b.event_name,a.event_id, a.id AS item_id, b.event_name, a.item_name, a.rarity, a.drop_rate,a.images,a.description
                 FROM gacha_items a
                 LEFT JOIN events b ON a.event_id = b.id
                 WHERE b.active = true
                 FOR SHARE`
            )

            if(itemsResult.rows.length === 0){
                throw new Error("No active items available to roll")
            }

            const rolls = []
            let history = {
                username,
                event_id:'',
                event_name:'',
                result:[],
                created_at:new Date().toISOString()
            };
            const inventoryUpdates = {};
            for(let i = 0; i < times; i++){
                const pickedItem = Events_models.weightedRandomPick(itemsResult.rows);
                rolls.push(pickedItem);
                // rolls.push(Events_models.weightedRandomPick(itemsResult.rows))
                inventoryUpdates[pickedItem.item_id] = (inventoryUpdates[pickedItem.item_id] || 0) + 1;
            }

            const updatedUser = await client.query(
                "UPDATE users SET coins = coins - $1 WHERE username = $2 RETURNING coins",
                [cost, username]
            )

            for(const item of rolls){
                if(history.event_id === ""){
                    history.event_id = item.event_id
                    history.event_name = item.event_name
                }
                history.result.push({
                    item_id: item.item_id,
                    item_name: item.item_name,
                    rarity: item.rarity,
                    drop_rate: item.drop_rate,
                    images:item.images,
                    description:item.description
                })
            }
            for (const [itemId, qty] of Object.entries(inventoryUpdates)) {
                await client.query(
                    `INSERT INTO public.user_inventories (user_id, item_id, qty, acquired_at,username)
                     VALUES ($1, $2, $3, NOW(),$4)
                     ON CONFLICT (user_id, item_id) 
                     DO UPDATE SET qty = user_inventories.qty + EXCLUDED.qty, acquired_at = NOW()`,
                    [userId, itemId, qty,username]
                );
            }
            await client.query(
                `INSERT INTO gacha_log (log) VALUES ($1)`,
                [JSON.stringify(history)]
            )
            
            await client.query("COMMIT")

            return {
                rolls: rolls.map(item => ({
                    event_name: item.event_name,
                    item_name: item.item_name,
                    rarity: item.rarity,
                    drop_rate: item.drop_rate,
                    images:item.images,
                    description:item.description
                })),
                total_cost: cost,
                remaining_coins: updatedUser.rows[0].coins
            }
        }catch(err){
            await client.query("ROLLBACK")
            throw err
        }finally{
            client.release()
        }
    }
    static async DeleteItem(id) {
        const sql = `DELETE FROM gacha_items WHERE id = $1 RETURNING *`;
        const result = await pool.query(sql, [id]);
        return result.rows[0]; 
    }
    static async UpdateItems(id, data){
        const result = await UpdateEvent("gacha_items", data, id) // 👈 correct order
        return result
    }
}

module.exports = Events_models