const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Model = require("./auth_models");
const { COOKIE_NAME, EXPIRES_IN_SEC } = require("../../libs/core_functions");

class Authentication_controllers {
    
    static async Register(req, res) {
        try {
            const { email, password, username,role } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const existingUser = await Model.FindByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: "Email Already Use !" });
            }
            const existingUsername = await Model.FindByUserName(username)
            if(existingUsername){
                return res.status(409).json({error:"Username Already Use !"})
            }
            const response = await Model.Register({
                email,
                password: hashedPassword,
                username,
                role
            });

            res.json({ result: true, data: response });
        } catch (err) {
            res.status(500).json({ error: "Something went wrong", details: err.message });
        }
    }

    static async Login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await Model.FindByUserName(username);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            let users = {user:user.username,email:user.email,coins:user.coins,role:user.role,rarity:user.rarity,drop_rate:user.drop_rate}
            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: EXPIRES_IN_SEC }
            );

            res.cookie(COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: EXPIRES_IN_SEC * 1000,
            });
            return res.json({ result: true, message: "Logged in",username,users });
        } catch (err) {
            res.status(500).json({ error: "Something went wrong", details: err.message });
        }
    }

    static async Logout(req, res) {
        res.clearCookie(COOKIE_NAME);
        return res.json({ result: true, message: "Logged out" });
    }
}

module.exports = Authentication_controllers;