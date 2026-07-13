const Model = require("./history_model");

class History_controller {
    static async GetHistory(req, res) {
        try {
            const username = req.user.username; // from JWT (set by authJWT middleware)
            console.log("ini username : ", username)
            const response = await Model.getHistory(username);
            res.json({ result: true, message: "Fetching data successfully", data: response });
        } catch (err) {
            res.status(500).json({ error: "Something wrong", detail: err.message });
        }
    }
}

module.exports = History_controller;