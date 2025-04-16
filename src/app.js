import express from "express";
import cors from "cors";
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
import path from "path";

// Variables
dotenv.config();
const APP = express();
const PORT = 8080;
const HOST = "localhost";

// Middlewares
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cookieParser());
APP.use(passport.initialize());
initializePassport();

APP.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

APP.use((req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";
    const allowSwagger = req.originalUrl.startsWith("/api/docs");
    const allowStatic = req.originalUrl.startsWith("/profile") || req.originalUrl === "/";
    if (isProduction && !allowSwagger && !allowStatic) return res.status(403).json({ message: "Acceso a la API no permitido en producción.." });
    next();
});  

// Servir imágenes desde la carpeta public
APP.use("/", express.static(path.join(process.cwd(), "src/public")));

// Rutas
APP.get("/", (req, res) => res.send(`<h1>Este es nuestro backend de un sistema de reservas!!</h1> <h3>Para obtener mas información, ingresa a nuestra documentación con Swagger..</h3>  <a href="/api/docs" target="_blank"><button>Swagger</button></a>`));
APP.use("/api/users", usersRouter);
APP.use("/api/sessions", sessionsRouter);
APP.use("/api/seasons", seasonsRouter);
APP.use("/api/lodges", lodgesRouter);
APP.use("/api/reservations", reservationsRouter);
APP.use("/api/records", recordsRouter);

// Swagger
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