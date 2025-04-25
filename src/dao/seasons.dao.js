import SeasonModel from "../models/seasons.models.js";
import { connectDB } from "../config/mongoose.config.js";

export default class SeasonsDao {

    gets = async() => {
        try {
            await connectDB();
            return await SeasonModel.find();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            await connectDB();
            const item = await SeasonModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    deleteAll = async () => {
        try {
            await connectDB();
            await SeasonModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    
};