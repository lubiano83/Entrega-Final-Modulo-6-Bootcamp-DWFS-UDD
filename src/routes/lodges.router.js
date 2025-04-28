import { Router } from "express";
import LodgesControllers from "../controllers/lodges.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";

const ROUTER = Router();
const lodgesControllers = new LodgesControllers();

ROUTER.get("/", lodgesControllers.getLodges);
ROUTER.delete("/", lodgesControllers.deleteAllLodges);
ROUTER.post("/:userId", lodgesControllers.createLodge);
ROUTER.get("/:id", lodgesControllers.getLodgeById);
ROUTER.put("/:id",lodgesControllers.updateLogdeById);
ROUTER.patch("/:id", uploadProfile.single("image"), convertToWebp, lodgesControllers.addImageToLodge);
ROUTER.delete("/:id", lodgesControllers.deleteLodgeById);
ROUTER.delete("/image/:id", lodgesControllers.deleteAllImageFromLodge);
ROUTER.patch("/available/:id", lodgesControllers.changeAvailableById);
ROUTER.get("/user/:userId", lodgesControllers.getLodgesByUserId);

export default ROUTER;