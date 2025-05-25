import { Router } from "express";
import RecordsControllers from "../controllers/records.controllers.js";

const ROUTER = Router();
const recordsController = new RecordsControllers();

ROUTER.get("/", recordsController.getRecords);
ROUTER.get("/:id", recordsController.getRecordById);
ROUTER.delete("/:id", recordsController.deleteRecordById);
ROUTER.get("/user/:userId", recordsController.getRecordsByUserId);
ROUTER.delete("/delete/all", recordsController.deleteAllRecords);

export default ROUTER;
