import RecordModel from "../models/records.model.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class RecordsDao {

    paginate = async (filters = {}, options = {}) => {
        try {
            await connectDB();
            return await RecordModel.paginate(filters, options);
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    gets = async() => {
        try {
            await connectDB();
            return await RecordModel.find();
        } catch (error) {
            throw new Error("Hubo un error en el servidor..", error.message );
        }
    };

    getById = async( id ) => {
        try {
            await connectDB();
            if (!isValidId(id)) throw new Error("ID no válido");
            return await RecordModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    getByProperty = async( doc ) => {
        try {
            await connectDB();
            return await RecordModel.find( doc );
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            await connectDB();
            const item = await RecordModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    updateById = async(id, doc ) => {
        try {
            await connectDB();
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) throw new Error("Item no encontrado..");
            return await RecordModel.findByIdAndUpdate( id, { $set: doc }, { new: true });
        } catch ( error ) {
            throw new Error("Hubo un error en el servidor..", error.message);
        }
    };

    deleteById = async( id ) => {
        try {
            await connectDB();
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) return new Error("Usuario no encontrado..");
            return await RecordModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteAll = async () => {
        try {
            await connectDB();
            await RecordModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error("Hubo un error en el servidor..", error.message);
        }
    };    
};