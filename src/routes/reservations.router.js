import { Router } from "express";
import passport from "passport";
import ReservationsController from "../controllers/reservations.controllers.js";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const reservationsController = new ReservationsController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, justUsers, reservationsController.getReservations);
ROUTER.get("/:id", permissions, justUsers, reservationsController.getReservationById);
ROUTER.delete("/:id", permissions, justUsers, reservationsController.deleteReservationById);
ROUTER.put("/:id", permissions, justUsers, reservationsController.updateReservationById);
ROUTER.patch("/:id", permissions, justUsers, reservationsController.isAlreadyPaid);
ROUTER.post("/:lodgeId/:userId", permissions, justUsers, reservationsController.createReservation);
ROUTER.get("/user/:userId", permissions, justUsers, reservationsController.getReservationsByUserId);
ROUTER.delete("/delete/all", permissions, justUsers, reservationsController.deleteAllReservations);

export default ROUTER;