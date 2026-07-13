const pool = require("../../config/connection");
const { InsertEvents } = require("../../libs/core_functions");

class Authentication_models {
    static async Register(data) {
        const result = await InsertEvents("users",data)
        return result
    }

    static async FindByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }
    static async FindByUserName(username) {
        const query = `SELECT 
                            u.username, 
                            u.email, 
                            u.role, 
                            u.coins, 
                            u.PASSWORD, 
                            g.rarity, 
                            g.drop_rate
                        FROM users u
                        CROSS JOIN (
                            SELECT rarity, drop_rate
                            FROM gacha_items
                            ORDER BY CASE rarity
                                WHEN 'Legendaris' THEN 1
                                WHEN 'Langka' THEN 2
                                WHEN 'Biasa' THEN 3
                                ELSE 4
                            END
                            LIMIT 1
                        ) g 
        WHERE username = $1 LIMIT 1`;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }
}

module.exports = Authentication_models;