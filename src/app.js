import express from "express";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import seasonsRouter from "./routes/seasons.router.js";
import lodgesRouter from "./routes/lodges.router.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Variables
dotenv.config();
const APP = express();
const PORT = 8080;
const HOST = "localhost";

// Define manualmente __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cookieParser());
APP.use(passport.initialize());
initializePassport();

// Servir imágenes desde la carpeta public
APP.use("/", express.static(path.join(process.cwd(), "src/public")));

// Servir imágenes personalizadas desde la carpeta public/profile
APP.use("/profile", express.static(path.join(process.cwd(), "src/public/profile")));

// Rutas
APP.use("/api/users", usersRouter);
APP.use("/api/sessions", sessionsRouter);
APP.use("/api/seasons", seasonsRouter);
APP.use("/api/lodges", lodgesRouter);

// Listening
APP.listen(PORT, () => console.log(`Escuchando en http://${HOST}:${PORT}`));