import { Router } from "express";
import LodgesControllers from "../controllers/lodges.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const lodgesControllers = new LodgesControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", lodgesControllers.getLodges);
ROUTER.post("/:userId", lodgesControllers.createLodge);
ROUTER.get("/:id", lodgesControllers.getLodgeById);
ROUTER.put("/:id",lodgesControllers.updateLogdeById);
ROUTER.patch("/:id", uploadProfile.single("image"), convertToWebp, lodgesControllers.addImageToLodge);
ROUTER.delete("/:id", lodgesControllers.deleteLodgeById);
ROUTER.delete("/image/:id", lodgesControllers.deleteAllImageFromLodge);
ROUTER.patch("/wifi/:id", lodgesControllers.changeWifiById);
ROUTER.patch("/available/:id", lodgesControllers.changeAvailableById);
ROUTER.patch("/location/:id", lodgesControllers.changeLocation);
ROUTER.get("/user/:userId", lodgesControllers.getLodgesByUserId);
ROUTER.delete("/delete/all", lodgesControllers.deleteAllLodges);

export default ROUTER;