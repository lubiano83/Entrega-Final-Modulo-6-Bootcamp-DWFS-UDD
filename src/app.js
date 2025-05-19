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

// Variables
dotenv.config();
const APP = express();
const PORT = 8080;
const HOST = "localhost";

// Direcciones
const allowedOrigins = [
  // "http://localhost:5173",
  "https://las-trancas-lodges.netlify.app"
];

// Cors
APP.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Solicitud bloqueada por CORS desde:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true
}));

// Middlewares
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cookieParser());
APP.use(passport.initialize());
initializePassport()

// Rutas
APP.get("/", (req, res) => res.send(`<h1>Este es nuestro backend de un sistema de reservas!!</h1> <h3>Para obtener mas información, ingresa a nuestra documentación con Swagger.. <span><a href="/api/docs" target="_blank"><button>Swagger</button></a></span></h3> <div> <a href="/api/users" target="_blank"><button>Users</button></a> <a href="/api/sessions" target="_blank"><button>Sessions</button></a> <a href="/api/seasons" target="_blank"><button>Seasons</button></a> <a href="/api/lodges" target="_blank"><button>Lodges</button></a> <a href="/api/reservations" target="_blank"><button>Reservations</button></a> <a href="/api/records" target="_blank"><button>Records</button></a> </div> `));
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
APP.use((error, req, res, next) => {
    console.error("Error:", error.message);
    res.status(500).send({ message: "Error interno del servidor", error: error.message });
});

// Listening
APP.listen(PORT, () => console.log(`Escuchando en http://${HOST}:${PORT}`));