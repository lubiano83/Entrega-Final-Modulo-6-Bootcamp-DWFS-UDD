import { Router } from "express";
import SeasonsController from "../controllers/seasons.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const seasonsController = new SeasonsController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", seasonsController.getSeasons);
ROUTER.post("/", seasonsController.createSeason);

export default ROUTER;