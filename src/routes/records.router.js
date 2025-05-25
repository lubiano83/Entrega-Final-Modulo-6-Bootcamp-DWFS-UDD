import { Router } from "express";
import RecordsControllers from "../controllers/records.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const recordsController = new RecordsControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", recordsController.getRecords);
ROUTER.get("/:id", recordsController.getRecordById);
ROUTER.delete("/:id", recordsController.deleteRecordById);
ROUTER.get("/user/:userId", recordsController.getRecordsByUserId);
ROUTER.delete("/delete/all", recordsController.deleteAllRecords);

export default ROUTER;
