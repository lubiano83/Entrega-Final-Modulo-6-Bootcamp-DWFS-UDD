import { Router } from "express";
import SeasonsController from "../controllers/seasons.controllers.js";

const seasonsController = new SeasonsController();

const ROUTER = Router();

ROUTER.get("/", seasonsController.getSeasons);
ROUTER.post("/", seasonsController.createSeason);

export default ROUTER;