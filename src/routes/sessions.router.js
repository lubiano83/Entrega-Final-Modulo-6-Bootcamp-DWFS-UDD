import { Router } from "express";
import SessionsControllers from "../controllers/sessions.controllers.js";

const ROUTER = Router();
const sessionsControllers = new SessionsControllers();

ROUTER.get("/", sessionsControllers.getSessions);
ROUTER.get("/:userId", sessionsControllers.getSessionById);
ROUTER.post("/register", sessionsControllers.registerUser);
ROUTER.post("/login", sessionsControllers.loginUser);
ROUTER.post("/logout", sessionsControllers.logoutUser);
ROUTER.get("/users/registered", sessionsControllers.usersRegistered);
ROUTER.get("/users/logged", sessionsControllers.usersLogged);

export default ROUTER;