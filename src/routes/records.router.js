import { Router } from "express";
import RecordsControllers from "../controllers/records.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const recordsController = new RecordsControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, justUsers, recordsController.getRecords);
ROUTER.get("/:id", permissions, justUsers, recordsController.getRecordById);
ROUTER.delete("/:id", permissions, justUsers, recordsController.deleteRecordById);
ROUTER.get("/user/:userId", permissions, justUsers, recordsController.getRecordsByUserId);
ROUTER.delete("/delete/all", permissions, justDev, recordsController.deleteAllRecords);

export default ROUTER;
