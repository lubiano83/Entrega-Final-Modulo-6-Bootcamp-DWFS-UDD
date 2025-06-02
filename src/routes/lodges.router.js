import { Router } from "express";
import LodgesControllers from "../controllers/lodges.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const lodgesControllers = new LodgesControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", lodgesControllers.getLodges);
ROUTER.post("/:userId", permissions, justUsers, lodgesControllers.createLodge);
ROUTER.get("/:id", permissions, justUsers, lodgesControllers.getLodgeById);
ROUTER.put("/:id", permissions, justUsers, lodgesControllers.updateLogdeById);
ROUTER.patch("/:id", permissions, justUsers, uploadProfile.single("image"), convertToWebp, lodgesControllers.addImageToLodge);
ROUTER.delete("/:id", permissions, justUsers, lodgesControllers.deleteLodgeById);
ROUTER.delete("/image/:id", permissions, justUsers, lodgesControllers.deleteAllImageFromLodge);
ROUTER.patch("/wifi/:id", permissions, justUsers, lodgesControllers.changeWifiById);
ROUTER.patch("/available/:id", permissions, justUsers, lodgesControllers.changeAvailableById);
ROUTER.patch("/location/:id", permissions, justUsers, lodgesControllers.changeLocation);
ROUTER.get("/user/:userId", permissions, justUsers, lodgesControllers.getLodgesByUserId);
ROUTER.delete("/delete/all", permissions, justDev, lodgesControllers.deleteAllLodges);

export default ROUTER;