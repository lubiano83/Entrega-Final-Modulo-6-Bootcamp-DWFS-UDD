import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";

const ROUTER = Router();
const usersController = new UsersControllers();

ROUTER.get("/", usersController.getUsers);
ROUTER.delete("/:id", usersController.deleteUserById);
ROUTER.put("/:id", usersController.updateUserById);
ROUTER.post("/register", usersController.registerUser);
ROUTER.post("/login", usersController.loginUser);
ROUTER.post("/logout", usersController.logoutUser);
ROUTER.get("/registered", usersController.usersRegistered);
ROUTER.get("/logged", usersController.usersLogged);
ROUTER.patch("/image/:id", uploadProfile.single("image"), convertToWebp, usersController.changeImageById);
ROUTER.patch("/role/:id", usersController.changeRoleById);
ROUTER.delete("/delete/all", usersController.deleteAllUsers);

export default ROUTER;