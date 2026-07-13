const pool = require("../../config/connection");
const crypto = require("crypto");
const { InsertEvents, UpdateEvent } = require("../../libs/core_functions");

const COST_PER_ROLL = 10;
const MAX_ROLLS_PER_REQUEST = 10; // anti-abuse cap on batch size

class History_models {
  static async getHistory(username) {
    const userResult = await pool.query(
      "SELECT role FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      throw new Error(`User "${username}" not found`);
    }

    const role = userResult.rows[0].role;
    console.log("ini rolenya : ", role);

    let sql = `
      SELECT
        log->>'username' AS username,
        log->>'event_name' AS event_name,
        to_char((log->>'created_at')::timestamptz, 'DD Mon YYYY HH24:MI:SS') AS gacha_date,
        jsonb_array_length(log->'result') AS total_rolls,
        log->>'result' AS result_gacha
      FROM gacha_log
    `;

    const values = [];

    if (username && role === "user") {
      sql += ` WHERE log->>'username' = $1`;
      values.push(username);
    }

    sql += ` ORDER BY (log->>'created_at')::timestamptz DESC`;

    const result = await pool.query(sql, values);
    return result.rows;
  }
}

module.exports = History_models;