
const { sanitizeName, saveBase64AsWebp,ensureEventAssetDir } = require("../../libs/core_functions");
const { getIO } = require("../../middleware/sockets")
const Model = require("./event_models")
const path = require("path");     // 👈 add this line
const sharp = require("sharp");   // 👈 and this one, needed for saveBase64AsWebp
const fs = require("fs/promises");

class Events_controller{
    static async InsertEvent(req, res) {
        try {
            const { event_name, description, start_date, end_date, images } = req.body;
            
            const EVENT_ASSET_DIR = path.join(__dirname, "../../assets/events");
            await fs.mkdir(EVENT_ASSET_DIR, { recursive: true }); // 👈 also fix typo below
            await ensureEventAssetDir();
            const baseFileName = sanitizeName(event_name);

            let imageList = [];
            if (images) {
                try {
                imageList = JSON.parse(images);
                } catch {
                return res.status(400).json({ error: "Invalid images payload" });
                }
            }

            const savedFileNames = [];
            for (let i = 0; i < imageList.length; i++) {
                const fileName = await saveBase64AsWebp(imageList[i], EVENT_ASSET_DIR, baseFileName, i);
                savedFileNames.push(fileName);
            }

            const payload = {
                event_name,
                description,
                start_date,
                end_date,
                images: JSON.stringify(savedFileNames),
            };

            const response = await Model.InsertEvent(payload);
            getIO().emit("Events", response);
            res.json({ result: true, message: "Insert Data successfully", data: response });
            } catch (err) {
            res.status(500).json({ error: "Something wrong", detail: err.message });
            }
    }
    static async UpdatesEvent(req, res) {
        try {
            const { event_name, description, start_date, end_date, images, existing_images } = req.body;
            const { id } = req.params;
            const EVENT_ASSET_DIR = path.join(__dirname, "../../assets/events");
            await fs.mkdir(EVENT_ASSET_DIR, { recursive: true });
            await ensureEventAssetDir();
            const baseFileName = sanitizeName(event_name);

            // New images uploaded in this request (base64 strings)
            let imageList = [];
            if (images) {
                try {
                    imageList = JSON.parse(images);
                } catch {
                    return res.status(400).json({ error: "Invalid images payload" });
                }
            }

            // Existing images the user chose to KEEP (already-saved filenames, not base64)
            let keptFileNames = [];
            if (existing_images) {
                try {
                    keptFileNames = JSON.parse(existing_images);
                } catch {
                    return res.status(400).json({ error: "Invalid existing_images payload" });
                }
            }

            // Save any newly uploaded base64 images to disk
            const savedFileNames = [];
            for (let i = 0; i < imageList.length; i++) {
                const fileName = await saveBase64AsWebp(imageList[i], EVENT_ASSET_DIR, baseFileName, i);
                savedFileNames.push(fileName);
            }

            // Final image list = images the user kept + images newly uploaded
            const finalImages = [...keptFileNames, ...savedFileNames];

            const payload = {
                event_name,
                description,
                start_date,
                end_date,
                images: JSON.stringify(finalImages),
            };

            const response = await Model.UpdateEvents(payload, id);
            getIO().emit("Events", response);
            res.json({ result: true, message: "Update Data successfully", data: response });
        } catch (err) {
            res.status(500).json({ error: "Something wrong", detail: err.message });
        }
    }

    static async insertItems(req,res){
        try{
            const {event_id,item_name,rarity,drop_rate,images,description} = req.body
            const EVENT_ASSET_DIR = path.join(__dirname, "../../assets/items")
            await fs.mkdir(EVENT_ASSET_DIR, { recursive: true });
            await ensureEventAssetDir();
            const baseFileName = sanitizeName(item_name)

            if(!images){
                return res.status(400).json({ error: "Invalid images payload" });
            }
            const fileName = await saveBase64AsWebp(images,EVENT_ASSET_DIR,baseFileName,1)
            const payload ={
                event_id,
                item_name,
                rarity,
                drop_rate,
                images:fileName,
                description
            }
            const response = await Model.InsertItems(payload)
            res.json({result:true,message:"Insert Data successfully",data:response})
        }catch(err){
            res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }
    static async GetItems(req,res){
        try{
            const response = await Model.getItems()
            res.json({result:true,message:"Fetching data successfully", data:response})
        }catch(err){
            res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }
    static async GetEvents(req,res){
        try{
            const response = await Model.getEvents()
            res.json({result:true,message:"Fetching data successfully", data:response})
        }catch(err){
             res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }
    static async UpdateStatus(req,res){
        try{
            const response = await Model.updateStatus(req.body)
            res.json({result:true,message:"Fetching data successfully", data:response})
        }catch(err){
             res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }

    static async GachaGame(req,res){
        try{
            const username = req.body.username // must come from a verified session/token, not the raw body
            // const username = req.user?.username
            const gachaTimes = parseInt(req.body.times, 10)
            console.log("ini username",username)
            if(!username){
                return res.status(401).json({error:"Unauthorized"})
            }
            if(!Number.isInteger(gachaTimes) || gachaTimes <= 0){
                return res.status(400).json({error:"times must be a positive integer"})
            }

            const result = await Model.rollGacha(username, gachaTimes)
            getIO().to(`user:${username}`).emit("gacha_result", {
                remaining_coins: result.remaining_coins,
                rolls: result.rolls
            })
            res.json({result:true, message:"Roll Successfully", data:result})

        }catch(err){
            if(err.message === "Insufficient balance"){
                return res.status(402).json({error:"Coin not enough for draw"})
            }
            if(err.message === "User not found" || err.message === "No active items available to roll"){
                return res.status(404).json({error:err.message})
            }
            if(err.message.includes("times")){
                return res.status(400).json({error:err.message})
            }
            res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }

    static async DeleteItem(req,res){
        try{
            const { id } = req.params;
            const response = await Model.DeleteItem(id)
            res.json({result:true,message:"Fetching data successfully", data:response})

        }catch(err){
            res.status(500).json({error:"Something wrong", detail:err.message})
        }
    }
    static async updateItems(req, res) {
    try {
            const { id, event_id, item_name, rarity, drop_rate, images, description } = req.body;

            if (!id) {
                return res.status(400).json({ error: "id is required" });
            }

            const EVENT_ASSET_DIR = path.join(__dirname, "../../assets/items");
            await fs.mkdir(EVENT_ASSET_DIR, { recursive: true });
            const baseFileName = sanitizeName(item_name);

            const payload = { event_id, item_name, rarity, drop_rate, description };

            // Only touch the image field if a new base64 image was actually sent
            if (images) {
                const fileName = await saveBase64AsWebp(images, EVENT_ASSET_DIR, baseFileName, 1);
                payload.images = fileName;
            }

            const response = await Model.UpdateItems(id, payload);
            res.json({ result: true, message: "Update Data successfully", data: response });
        } catch (err) {
            res.status(500).json({ error: "Something wrong", detail: err.message });
        }
    }

}



module.exports = Events_controller
// for a prive Notification
// getIO().to(`user:${userId}`).emit("gacha_result", result);