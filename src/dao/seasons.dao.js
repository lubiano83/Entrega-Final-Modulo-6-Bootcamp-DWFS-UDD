import SeasonModel from "../models/seasons.models.js";
import { connectDB } from "../config/mongoose.config.js";

export default class SeasonsDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    gets = async() => {
        try {
            return await SeasonModel.find();
        } catch (error) {
            throw new Error("Hubo un error al obtener los usuarios..", error.message );
        }
    };

    create = async( data ) => {
        try {
            const season = await SeasonModel( data );
            await season.save();
            return season;
        } catch (error) {
            throw new Error( "Error al crear un usuario..", error.message );
        }
    }

    deleteAll = async () => {
        try {
            const result = await SeasonModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error("Error al eliminar todos los usuarios..", error.message);
        }
    };    
};