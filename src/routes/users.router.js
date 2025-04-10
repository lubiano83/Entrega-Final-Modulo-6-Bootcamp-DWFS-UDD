import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";
import passport from "passport";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const usersController = new UsersControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", usersController.getUsers);
ROUTER.delete("/:id", usersController.deleteUserById);
ROUTER.put("/:id", usersController.updateUserById);
ROUTER.get("/registered", usersController.usersRegistered);
ROUTER.get("/logged", usersController.usersLogged);
ROUTER.post("/register", usersController.registerUser);
ROUTER.post("/login", usersController.loginUser);
ROUTER.post("/logout", usersController.logoutUser);
ROUTER.patch("/image/:id", uploadProfile.single("image"), convertToWebp, usersController.changeImageById);
ROUTER.patch("/role/:id", usersController.changeRoleById);
ROUTER.delete("/delete/all", usersController.deleteAllUsers);

export default ROUTER;