import UserModel from "../models/users.models.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class UsersDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    paginate = async (filters = {}, options = {}) => {
        try {
            return await UserModel.paginate(filters, options);
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    gets = async() => {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    getById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido..");
            return await UserModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    getByProperty = async( doc ) => {
        try {
            return await UserModel.find( doc );
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            const item = await UserModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    updateById = async (id, doc) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido..");
            const item = await this.getById(id);
            if (!item) throw new Error("No encontrado..");
            return await UserModel.findByIdAndUpdate(id, doc, { new: true });
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    

    deleteById = async( id ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) return new Error("No encontrado..");
            return await UserModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteAll = async () => {
        try {
            await UserModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    
};