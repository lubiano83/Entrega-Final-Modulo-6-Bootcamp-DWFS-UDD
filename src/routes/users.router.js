import { Router } from "express";
import passport from "passport";
import UsersControllers from "../controllers/users.controllers.js";
import { uploadProfile, convertToWebp } from "../middlewares/uploader.middlewares.js";
import { justUsers, justAdmin, justDev } from "../middlewares/auth.middlewares.js";

const ROUTER = Router();
const usersController = new UsersControllers();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, justUsers, usersController.getUsers);
ROUTER.get("/:id", permissions, justUsers, usersController.getUserById);
ROUTER.put("/:id", permissions, justUsers, usersController.updateUserById);
ROUTER.delete("/:id", permissions, justUsers, usersController.deleteUserById);
ROUTER.patch("/image/:id", permissions, justUsers, uploadProfile.single("image"), convertToWebp, usersController.changeImageById);
ROUTER.patch("/role/:id", permissions, justUsers, usersController.changeRoleById);
ROUTER.patch("/plan/:id", permissions, justUsers, usersController.changePlanById);
ROUTER.delete("/delete/all", permissions, justUsers, usersController.deleteAllUsers);

export default ROUTER;