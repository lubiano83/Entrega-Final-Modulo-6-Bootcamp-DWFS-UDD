import { Router } from "express";
import ReservationsController from "../controllers/reservations.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const reservationsController = new ReservationsController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", reservationsController.getReservations);
ROUTER.get("/:id", reservationsController.getReservationById);
ROUTER.delete("/:id", reservationsController.deleteReservationById);
ROUTER.put("/:id", reservationsController.updateReservationById);
ROUTER.patch("/:id", reservationsController.isAlreadyPaid);
ROUTER.post("/:lodgeId/:userId", reservationsController.createReservation);
ROUTER.get("/user/:userId", reservationsController.getReservationsByUserId);
ROUTER.delete("/delete/all", reservationsController.deleteAllReservations);

export default ROUTER;