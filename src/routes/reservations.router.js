import { Router } from "express";
import ReservationsController from "../controllers/reservations.controllers.js";

const ROUTER = Router();
const reservationsController = new ReservationsController();

ROUTER.get("/", reservationsController.getReservations);
ROUTER.get("/:id", reservationsController.getReservationById);
ROUTER.delete("/:id", reservationsController.deleteReservationById);
ROUTER.put("/:id", reservationsController.updateReservationById);
ROUTER.patch("/:id", reservationsController.isAlreadyPaid);
ROUTER.post("/:lodgeId/:userId", reservationsController.createReservation);
ROUTER.delete("/delete/all", reservationsController.deleteAllReservations);

export default ROUTER;