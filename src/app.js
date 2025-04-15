import express from "express";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import seasonsRouter from "./routes/seasons.router.js";
import lodgesRouter from "./routes/lodges.router.js";
import reservationsRouter from "./routes/reservations.router.js";
import recordsRouter from "./routes/records.router.js";
import { swaggerServe, swaggerSetup } from "./config/swagger.config.js";
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
APP.use("/api/reservations", reservationsRouter);
APP.use("/api/records", recordsRouter);
APP.use("/api/docs", swaggerServe, swaggerSetup);


// Método que gestiona las rutas inexistentes.
APP.use((req, res) => {
    return res.status(404).send("<h1>Error 404: Not Found</h1>");
});

// Control de errores internos
APP.use((error, req, res) => {
    console.error("Error:", error.message);
    res.status(500).send("<h1>Error 500: Error en el Servidor</h1>");
});

// Listening
APP.listen(PORT, () => console.log(`Escuchando en http://${HOST}:${PORT}`));