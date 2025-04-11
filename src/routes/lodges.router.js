import { Router } from "express";
import LodgesControllers from "../controllers/lodges.controllers.js";

const ROUTER = Router();
const lodgesControllers = new LodgesControllers();

ROUTER.get("/", lodgesControllers.getLodges);
ROUTER.post("/", lodgesControllers.createLodge);
ROUTER.delete("/", lodgesControllers.deleteAllLodges);
ROUTER.get("/:id", lodgesControllers.getLodgeById);
ROUTER.put("/:id",lodgesControllers.updateLogdeById);
ROUTER.patch("/:id", lodgesControllers.addImageToLodge);
ROUTER.delete("/:id", lodgesControllers.deleteLodgeById);
ROUTER.delete("/image/:id", lodgesControllers.deleteAllImageFromLodge);
ROUTER.patch("/available/:id", lodgesControllers.changeAvailableById);

export default ROUTER;