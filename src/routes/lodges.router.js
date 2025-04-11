import { Router } from "express";
import LodgesControllers from "../controllers/lodges.controllers.js";

const ROUTER = Router();
const lodgesControllers = new LodgesControllers();

ROUTER.get("/", lodgesControllers.getLodges);
ROUTER.post("/", lodgesControllers.createLodge);
ROUTER.delete("/", lodgesControllers.deleteAllLodges);
ROUTER.patch("/:id", lodgesControllers.addImageToLodge);
ROUTER.delete("/image/:id", lodgesControllers.deleteAllImageFromLodge);

export default ROUTER;