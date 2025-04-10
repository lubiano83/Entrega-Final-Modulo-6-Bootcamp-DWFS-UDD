import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";
import { uploadProfile, convertToWebp } from "../utils/uploader.utils.js";

const ROUTER = Router();
const usersController = new UsersControllers();

ROUTER.get("/", usersController.getUsers);
ROUTER.delete("/:id", usersController.deleteUserById);
ROUTER.put("/:id", usersController.updateUserById);
ROUTER.post("/register", usersController.registerUser);
ROUTER.post("/login", usersController.loginUser);
ROUTER.post("/logout", usersController.logoutUser);
ROUTER.patch("/image/:id", uploadProfile.single("image"), convertToWebp, usersController.changeImage);
ROUTER.delete("/delete/all", usersController.deleteAllUsers);

export default ROUTER;