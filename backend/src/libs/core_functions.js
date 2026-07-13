const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");
const pool = require("../config/connection");

const COOKIE_NAME = "access_token";
const EXPIRES_IN_SEC = 15 * 60; // 15 minutes

// Single source of truth for where event images live.
// __dirname here is .../libs, so this resolves to .../src/assets/events
const EVENT_ASSET_DIR = path.join(__dirname, "../src/assets/events");

const generateSha256 = (word) =>
    crypto.createHash("sha256").update(word).digest("hex");

const authSha256 = (word) => (req, res, next) => {
    try {
        const clientHash = req.headers["x-access-sha"];
        if (!clientHash) return res.status(401).json({ error: "Unauthorized Access!" });
        if (clientHash !== generateSha256(word)) {
            return res.status(403).json({ error: "Invalid Authorization" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const authJWT = (req, res, next) => {
    try {
        const token = req.cookies[COOKIE_NAME];
        if (!token) {
            return res.status(401).json({ error: "Session expired, please log in" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // sliding session: reissue a fresh token/cookie on every valid request
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email, username: decoded.username },
            process.env.JWT_SECRET,
            { expiresIn: EXPIRES_IN_SEC }
        );

        res.cookie(COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: EXPIRES_IN_SEC * 1000,
        });

        next();
    } catch (err) {
        res.clearCookie(COOKIE_NAME);
        return res.status(403).json({ error: "Session expired or invalid" });
    }
};

const protect = (secretWord) => [
    authSha256(secretWord),
    authJWT,
];

const InsertEvents = async (table,data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) {
        const err = new Error("No data provided");
        err.status = 400;
        throw err;
    }

    const columns = keys.join(", ");
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *;`;

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error("Database Error:", err);
        if (err.code === '42703') {
            const customErr = new Error("Invalid field sent — one or more keys do not exist as columns in the table");
            customErr.status = 400;
            throw customErr;
        }
        throw err;
    }
};
const UpdateEvent = async(table,data,id)=>{
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
    }

    values.push(id);

    const query = `UPDATE ${table} SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

const sanitizeName = (name) => {
    return name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace spaces/special chars with hyphens
        .replace(/(^-|-$)/g, "");    // trim leading/trailing hyphens
};

// Ensures the asset directory exists. Call this once before saving images.
const ensureEventAssetDir = async () => {
    await fs.mkdir(EVENT_ASSET_DIR, { recursive: true });
};

// const saveBase64AsWebp = async (base64String, baseFileName, index) => {
//     const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
//     if (!matches) {
//         throw new Error(`Invalid image data at index ${index}`);
//     }
//     const buffer = Buffer.from(matches[2], "base64");
//     const fileName = `${baseFileName}-${index}-${Date.now()}.webp`;
//     const filePath = path.join(EVENT_ASSET_DIR, fileName);
//     console.log("file path : ",filePath)
//     await sharp(buffer).webp({ quality: 80 }).toFile(filePath);

//     return fileName;
// };
const saveBase64AsWebp = async (base64String, dir, baseFileName, index) => {
    const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
        throw new Error(`Invalid image data at index ${index}`);
    }
    const buffer = Buffer.from(matches[2], "base64");
    const fileName = `${baseFileName}-${index}-${Date.now()}.webp`;
    const filePath = path.join(dir, fileName); // 👈 uses passed-in dir now
    console.log("file path : ",filePath)
    await sharp(buffer).webp({ quality: 80 }).toFile(filePath);

    return fileName;
};

module.exports = {
    generateSha256,
    authSha256,
    authJWT,
    protect,
    COOKIE_NAME,
    EXPIRES_IN_SEC,
    InsertEvents,
    sanitizeName,
    saveBase64AsWebp,
    ensureEventAssetDir,
    EVENT_ASSET_DIR,
    UpdateEvent
};