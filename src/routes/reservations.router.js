import { Router } from "express";
import ReservationsController from "../controllers/reservations.controllers.js";

const ROUTER = Router();
const reservationsController = new ReservationsController();

ROUTER.get("/", reservationsController.getReservations);
ROUTER.delete("/", reservationsController.deleteAllReservations);
ROUTER.post("/:lodgeId/:userId", reservationsController.createReservation);

export default ROUTER;