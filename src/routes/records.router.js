import { Router } from "express";
import RecordsControllers from "../controllers/records.controllers.js";

const ROUTER = Router();
const recordsController = new RecordsControllers();

ROUTER.get("/", recordsController.getRecords);
ROUTER.delete("/", recordsController.deleteAllRecords);
ROUTER.get("/:id", recordsController.getRecordById);
ROUTER.delete("/:id", recordsController.deleteRecordById);

export default ROUTER;
