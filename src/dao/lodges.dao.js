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
            throw new Error("Hubo un error al paginar los usuarios..", error.message);
        }
    };

    gets = async() => {
        try {
            return await LodgeModel.find();
        } catch (error) {
            throw new Error("Hubo un error al obtener los lodges..", error.message );
        }
    };

    getById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await LodgeModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el lodge por el id..", error.message );
        }
    }

    getByProperty = async( doc ) => {
        try {
            return await LodgeModel.find( doc );
        } catch (error) {
            throw new Error( "Error al obtener el lodge por la propiedad..", error.message );
        }
    };

    create = async( userData ) => {
        try {
            const user = await LodgeModel( userData );
            await user.save();
            return user;
        } catch (error) {
            throw new Error( "Error al crear un lodge..", error.message );
        }
    }

    updateById = async(id, doc ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const lodge = await this.getById( id );
            if ( !lodge ) throw new Error("Usuario no encontrado..");
            return await LodgeModel.findByIdAndUpdate( id, { $set: doc }, { new: true });
        } catch ( error ) {
            throw new Error("Error al actualizar un lodge por el id..", error.message);
        }
    };

    deleteById = async( id ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const user = await this.getById( id );
            if ( !user ) return new Error("Usuario no encontrado..");
            return await LodgeModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Error al eliminar un lodge por el id..", error.message );
        }
    };

    deleteAllLodges = async () => {
        try {
            await LodgeModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error("Error al eliminar todos los lodges..", error.message);
        }
    };    
};