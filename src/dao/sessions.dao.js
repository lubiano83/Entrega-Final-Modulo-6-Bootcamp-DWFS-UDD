import SessionModel from "../models/sessions.models.js";
import { isValidId, connectDB } from "../config/mongoose.config.js";

export default class SessionsDao {

    gets = async () => {
        try {
            await connectDB();
            return await SessionModel.find();
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    create = async ( userId, token ) => {
        try {
            await connectDB();
            if ( !isValidId( userId )) throw new Error( "ID no válido.." );
            if ( !token ) throw new Error( "El token es requerido.." );
            const item = new SessionModel({ userId, token });
            await item.save();
            return item;
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    getById = async( userId ) => {
        try {
            await connectDB();
            if ( !isValidId( userId )) throw new Error( "ID no válido.." );
            const item = await SessionModel.findOne({ userId });
            return item;
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    }

    delete = async ( token ) => {
        try {
            await connectDB();
            if ( !token ) throw new Error( "El token es requerido.." );
            const item = await SessionModel.findOneAndDelete({ token });
            if ( !item ) throw new Error( "Sesión no encontrada.." );
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    getToken = async ( token ) => {
        try {
            await connectDB();
            if ( !token ) throw new Error( "El token es requerido.." );
            const item = await SessionModel.findOne({ token });
            if ( !item ) throw new Error( "No encontrado.." );
            return item;
        } catch ( error ) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };

    deleteAll = async () => {
        try {
            await connectDB();
            await SessionModel.deleteMany({});
            return await this.gets();
        } catch (error) {
            throw new Error( "Hubo un error en el servidor..", error.message );
        }
    };    
}