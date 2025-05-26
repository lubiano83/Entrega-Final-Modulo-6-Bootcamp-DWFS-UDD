import { Router } from "express";
import SessionsControllers from "../controllers/sessions.controllers.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const sessionsControllers = new SessionsControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", sessionsControllers.getSessions);
ROUTER.get("/:userId", sessionsControllers.getSessionById);
ROUTER.post("/register", sessionsControllers.registerUser);
ROUTER.post("/login", sessionsControllers.loginUser);
ROUTER.post("/logout", sessionsControllers.logoutUser);
ROUTER.get("/users/registered", sessionsControllers.usersRegistered);
ROUTER.get("/users/logged", sessionsControllers.usersLogged);
ROUTER.get("/current/user", sessionsControllers.getCurrentSession);
ROUTER.patch("/email/restart", sessionsControllers.restartPasswordByEmail);
ROUTER.patch("/password/:email", sessionsControllers.changePassword);
ROUTER.delete("/delete/all", sessionsControllers.deleteAllSessions);

export default ROUTER;