process.on('uncaughtException', err => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on('unhandledRejection', err => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");

const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./connection");
const corsOptions = require("../middleware/cors");
const { initSocket } = require("../middleware/sockets");

const app = express();

app.set("trust proxy", true);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  "/src/assets/items",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../assets/items"))
);

app.use(
  "/src/assets/events",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../assets/events"))
);
const server = http.createServer(app);

const startServer = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected successfully");

        const modulesPath = path.join(__dirname, "../modules");
        const moduleFolders = fs.readdirSync(modulesPath);

        moduleFolders.forEach((folder) => {
            const moduleIndexPath = path.join(modulesPath, folder, "routes.js");
            if (fs.existsSync(moduleIndexPath)) {
                require(moduleIndexPath)(app);
                console.log(`🔗 Module loaded: ${folder}`);
            }
        });

        initSocket(server,corsOptions)

        app.get("/", (req, res) => {
            res.status(200).json({ status: 200, message: "Berhasil Terkoneksi" });
        });

        const PORT = process.env.PORT || 5002;
        server.listen(PORT, "127.0.0.1", () => {
            console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to database:", err);
        process.exit(1);
    }
};

startServer(); // ⚠️ this line was missing — nothing runs without it