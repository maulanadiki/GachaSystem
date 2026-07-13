const controller = require("./history_controller")
const core = require("../../libs/core_functions")
const {gachaRollLimiter} = require("../../middleware/Limiters")

module.exports = (app)=>{
    app.get("/history",core.protect('history'),controller.GetHistory)
}