import LodgeModel from "../models/lodges.models.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class LodgesDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    paginate = async (filters = {}, options = {}) => {
        try {
            return await LodgeModel.paginate(filters, options);
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    gets = async() => {
        try {
            return await LodgeModel.find();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    getById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido..");
            return await LodgeModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    getByProperty = async( doc ) => {
        try {
            return await LodgeModel.find( doc );
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            const item = await LodgeModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    updateById = async(id, doc ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const lodge = await this.getById( id );
            if ( !lodge ) throw new Error("No encontrado..");
            return await LodgeModel.findByIdAndUpdate( id, { $set: doc }, { new: true });
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteById = async( id ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) return new Error("No encontrado..");
            return await LodgeModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteAllLodges = async () => {
        try {
            await LodgeModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    
};