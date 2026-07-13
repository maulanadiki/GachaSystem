const pool = require("../../config/connection");

class Inventory_model {
  static async getInventory(username) {
    let sql = `SELECT a.username,b.item_name,b.rarity,b.drop_rate,a.qty,b.images FROM user_inventories a
                LEFT JOIN gacha_items b ON a.item_id = b.id WHERE a.username = $1`;
    let values = [username];
    let result = await pool.query(sql, values);
    return result.rows;
  }
}

module.exports = Inventory_model;