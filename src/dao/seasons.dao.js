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
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            const item = await SeasonModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    deleteAll = async () => {
        try {
            await SeasonModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    
};