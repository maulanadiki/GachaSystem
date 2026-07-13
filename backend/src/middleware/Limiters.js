const { rateLimit, ipKeyGenerator } = require("express-rate-limit")

const gachaRollLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 5, // max 5 roll requests per user per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.username ? `user:${req.username}` : ipKeyGenerator(req)
    },
    message: { error: 'Too many roll requests, please slow down.' },
})

module.exports = { gachaRollLimiter }