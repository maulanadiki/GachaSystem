const {Server} = require('socket.io')
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { COOKIE_NAME } = require("../libs/core_functions");
const corsOptions = require('./cors');
const JWT_SECRET = process.env.JWT_SECRET

let io;
const initSocket = (server, corsOptions) => {
    io = new Server(server, {
        cors: {
            origin: corsOptions.origin,
            credentials: true,
        },
    });

    // io.use((socket, next) => {
    //     try {
    //         const rawCookies = socket.handshake.headers.cookie;
    //         if (!rawCookies) return next(new Error("No cookies sent"));

    //         const parsed = cookie.parse(rawCookies);
    //         const token = parsed[COOKIE_NAME];
    //         if (!token) return next(new Error("Unauthorized"));

    //         const decoded = jwt.verify(token, JWT_SECRET);
    //         socket.user = decoded; // available in every event handler below
    //         next();
    //     } catch (err) {
    //         next(new Error("Invalid or expired session"));
    //     }
    // });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Unauthorized"));

            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Invalid or expired session"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.user.email} (${socket.id})`);
        socket.join(`user:${socket.user.username}`);

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.user.email}`);
        });
        socket.on("ping_test", (data) => {
            socket.emit("pong_test", { received: data, time: Date.now() });
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized yet");
    return io;
};

module.exports = { initSocket, getIO };