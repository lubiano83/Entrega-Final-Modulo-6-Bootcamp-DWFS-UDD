import ReservationModel from "../models/reservations.models.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class ReservationsDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    gets = async() => {
        try {
            return await ReservationModel.find();
        } catch (error) {
            throw new Error("Hubo un error en el servidor..", error.message );
        }
    };

    getById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await ReservationModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    getByProperty = async( doc ) => {
        try {
            return await ReservationModel.find( doc );
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async( data ) => {
        try {
            const item = await ReservationModel( data );
            await item.save();
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    updateById = async(id, doc ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) throw new Error("Item no encontrado..");
            return await ReservationModel.findByIdAndUpdate( id, { $set: doc }, { new: true });
        } catch ( error ) {
            throw new Error("Hubo un error en el servidor..", error.message);
        }
    };

    deleteById = async( id ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido..");
            const item = await this.getById( id );
            if ( !item ) return new Error("Usuario no encontrado..");
            return await ReservationModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteAll = async () => {
        try {
            await ReservationModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error("Hubo un error en el servidor..", error.message);
        }
    };    
};