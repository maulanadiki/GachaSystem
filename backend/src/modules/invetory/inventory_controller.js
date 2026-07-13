const Model = require("./inventory_model");

class Inventory_controller {
    static async GetInventory(req, res) {
        try {
            const username = req.user.username; // from JWT (set by authJWT middleware)
            const response = await Model.getInventory(username);
            res.json({ result: true, message: "Fetching data successfully", data: response });
        } catch (err) {
            res.status(500).json({ error: "Something wrong", detail: err.message });
        }
    }
}

module.exports = Inventory_controller;