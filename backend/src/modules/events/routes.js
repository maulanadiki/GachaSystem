const controller = require("./events_controller")
const core = require("../../libs/core_functions")
const {gachaRollLimiter} = require("../../middleware/Limiters")

module.exports = (app)=>{
    app.post("/Events",core.protect('events'),controller.InsertEvent)
    app.get("/Events",core.protect('events'),controller.GetEvents)
    app.patch("/Events",core.protect('events'),controller.UpdateStatus)
    app.patch("/Events/:id",core.protect('events'),controller.UpdatesEvent)
    
    app.post("/Items",core.protect('items'),controller.insertItems)
    app.get("/items",core.protect('items'),controller.GetItems)
    app.patch("/items", core.protect('items'), controller.updateItems)
    app.post("/items/gacha",core.protect('gacha'),gachaRollLimiter,controller.GachaGame)
    app.delete("/items/:id",core.protect('items'),controller.DeleteItem)
}