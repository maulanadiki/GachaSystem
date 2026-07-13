const controller = require("./inventory_controller")
const core = require("../../libs/core_functions")


module.exports = (app)=>{
    app.get("/inventory",core.protect('inventory'),controller.GetInventory)
}