import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false; // Evita múltiples conexiones

const connectDB = async () => {
    if (isConnected) {
        return; // Ya está conectado, no se reconecta
    }

    const URI = process.env.MONGO_URL;
    const options = {
        dbName: process.env.DB_NAME,
        serverSelectionTimeoutMS: 30000,
    };

    try {
        await mongoose.connect(URI, options);
        isConnected = true;
        console.log("✅ Conectado a la base de datos");
    } catch (error) {
        console.error("❌ Error al conectar a la base de datos:", error.message);
        console.error(error);  // Imprime el error completo
        process.exit(1); // Detiene la app si falla la conexión
    }
};

// Validación de un ObjectId de MongoDB
const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export { connectDB, isValidId };