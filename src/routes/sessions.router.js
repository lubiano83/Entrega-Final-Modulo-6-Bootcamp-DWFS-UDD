import { Router } from "express";
import SessionsControllers from "../controllers/sessions.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const sessionsControllers = new SessionsControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, justUsers, sessionsControllers.getSessions);
ROUTER.get("/:userId", permissions, justUsers, sessionsControllers.getSessionById);
ROUTER.post("/register", sessionsControllers.registerUser);
ROUTER.post("/login", sessionsControllers.loginUser);
ROUTER.post("/logout", permissions, justUsers, sessionsControllers.logoutUser);
ROUTER.get("/users/registered", permissions, justAdmin, sessionsControllers.usersRegistered);
ROUTER.get("/users/logged", permissions, justAdmin, sessionsControllers.usersLogged);
ROUTER.get("/current/user", sessionsControllers.getCurrentSession);
ROUTER.delete("/delete/all", permissions, justDev, sessionsControllers.deleteAllSessions);

export default ROUTER;