import UserModel from "../models/users.models.js";
import { connectDB, isValidId } from "../config/mongoose.config.js";

export default class UsersDao {

    constructor() {
        connectDB(); // Intentamos conectar a la base de datos
    }

    getUsers = async() => {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error("Hubo un error al obtener los usuarios..", error.message );
        }
    };

    getUserById = async( id ) => {
        try {
            if (!isValidId(id)) throw new Error("ID no válido");
            return await UserModel.findOne({ _id: id });
        } catch (error) {
            throw new Error( "Error al obtener el usuario por el id: ", error.message );
        }
    }

    getUserByProperty = async( doc ) => {
        try {
            return await UserModel.find( doc );
        } catch (error) {
            throw new Error( "Error al obtener el usuario por el email..", error.message );
        }
    };

    createUser = async( data ) => {
        try {
            const user = await UserModel( data );
            await user.save();
            return user;
        } catch (error) {
            throw new Error( "Error al crear un usuario..", error.message );
        }
    }

    updateUserById = async( id, doc ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido");
            const user = await this.getUserById( id );
            if ( !user ) throw new Error("Usuario no encontrado");
            return await UserModel.findByIdAndUpdate( id, { $set: doc }, { new: true });
        } catch ( error ) {
            throw new Error("Error al actualizar un usuario por el id..", error.message);
        }
    };

    deleteUserById = async( id ) => {
        try {
            if ( !isValidId( id )) throw new Error("ID no válido");
            const user = await this.getUserById( id );
            if ( !user ) return new Error("Usuario no encontrado");
            return await UserModel.findOneAndDelete({ _id: id });
        } catch ( error ) {
            throw new Error( "Error al eliminar un usuario y su carrito..", error.message );
        }
    };

    deleteAllUsers = async () => {
        try {
            await UserModel.deleteMany({});
            return await this.getUsers();
        } catch (error) {
            throw new Error("Error al eliminar todos los usuarios..", error.message);
        }
    };    
};