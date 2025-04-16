import { Router } from "express";
import SessionsControllers from "../controllers/sessions.controllers.js";

const ROUTER = Router();
const sessionsControllers = new SessionsControllers();

ROUTER.get("/", sessionsControllers.getSessions);
ROUTER.get("/:userId", sessionsControllers.getSessionById);
ROUTER.get("/registered", sessionsControllers.usersRegistered);
ROUTER.get("/logged", sessionsControllers.usersLogged);
ROUTER.post("/register", sessionsControllers.registerUser);
ROUTER.post("/login", sessionsControllers.loginUser);
ROUTER.post("/logout", sessionsControllers.logoutUser);

export default ROUTER;