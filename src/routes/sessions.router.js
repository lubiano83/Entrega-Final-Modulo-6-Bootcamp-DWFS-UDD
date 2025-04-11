import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";

const ROUTER = Router();
const usersController = new UsersControllers();

ROUTER.get("/registered", usersController.usersRegistered);
ROUTER.get("/logged", usersController.usersLogged);
ROUTER.post("/register", usersController.registerUser);
ROUTER.post("/login", usersController.loginUser);
ROUTER.post("/logout", usersController.logoutUser);

export default ROUTER;