const corsOptions = {
    origin: ["https://localhost", "http://localhost","http://localhost:3000"],
    credentials: true, // required so the browser sends/receives the JWT cookie
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Access-Sha",
    ],
};

module.exports = corsOptions;