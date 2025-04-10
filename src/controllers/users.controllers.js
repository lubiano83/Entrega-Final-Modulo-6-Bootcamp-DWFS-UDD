import UsersDao from "../dao/users.dao.js";
import { createHash, isValidPassword } from "../utils/bcrypt.utils.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const usersDao = new UsersDao();

export default class UsersControllers {

    getUsers = async(req, res) => {
        try {
            const users = await usersDao.getUsers();
            return res.status(200).send({ message: "Todos los usuarios..", users });
        } catch (error) {
            res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    registerUser = async (req, res) => {
        try {
            const { first_name, last_name, email, phone, password, address } = req.body;
            const { country, state, city, street, number } = address;
            if (!first_name || !last_name || !phone || !email || !password || !country || !state || !city || !street || !number) return res.status(400).json({ message: "Todos los campos son requeridos.." });
            const existingUser = await usersDao.getUserByProperty({ email: email.toLowerCase() });
            if (existingUser.length > 0) return res.status(409).json({ message: "Ese email ya está registrado.." });
            if (password.length < 6 || password.length > 8) return res.status(400).json({ message: "La contraseña debe tener entre 6 y 8 caracteres.." });
            const newUser = { first_name: first_name.toLowerCase(), last_name: last_name.toLowerCase(), phone: String(phone), email: String(email), password: await createHash(String(password)), address: { country: country.toLowerCase(), state: state.toLowerCase(), city: city.toLowerCase(), street: street.toLowerCase(), number: String(number) }};
            if(isNaN(Number(number))) return res.status(400).send({ message: "El campo number debe ser tipo numero.." });
            await usersDao.createUser(newUser);
            return res.status(200).json({ message: "Usuario registrado con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    loginUser = async( req, res ) => {
        try {
            const { email, password } = req.body;
            if( !email || !password ) return res.status( 400 ).send({ message: "Todos los campos son requeridos.." });
            const users = await usersDao.getUserByProperty({ email: email.toLowerCase() });
            if( users.length === 0 ) return res.status( 409 ).json({ message: "Ese email no esta registrado.." });
            const passwordMatch = await isValidPassword(users[0], String(password));
            if ( !passwordMatch ) return res.status( 401 ).json({ status: 401, message: "La contraseña es incorrecta.." });
            const userLogged = req.cookies[ process.env.COOKIE_NAME ];
            if ( userLogged ) return res.status( 200 ).send({ message: "Ese usuario ya está logeado.." });
            const token = jwt.sign({ email: users[0].email.toLowerCase(), first_name: users[0].first_name.toLowerCase(), last_name: users[0].last_name.toLowerCase(), phone: users[0].phone, role: users[0].role.toLowerCase(), id: users[0]._id.toString() }, process.env.COOKIE_KEY, { expiresIn: "1h" });
            res.cookie( process.env.COOKIE_NAME, token, { maxAge: 3600000, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none", path: "/" });
            return res.status( 200 ).json({ message: "Login realizado con éxito", token });
        } catch ( error ) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    logoutUser = async(req, res) => {
        try {
            const token = req.cookies[process.env.COOKIE_NAME];
            if (!token) return res.status(401).send({ message: "Token no encontrado, sesión cerrada.." });
            res.clearCookie(process.env.COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none", path: "/" });
            return res.status(200).json({ message: "Logout realizado con éxito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateUserById = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getUserById(id);
            if(!user) return res.status(400).send({ message: "Ese usuario no existe.." });
            const { first_name, last_name, email, phone, address } = req.body;
            const { country, state, city, street, number } = address;
            if( !first_name || !last_name || !phone || !email || !country || !state || !city || !street || !number ) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const updatedUser = { first_name: first_name.toLowerCase(), last_name: last_name.toLowerCase(), email: String(email), address: { country: country.toLowerCase(), state: state.toLowerCase(), city: city.toLowerCase(), street: street.toLowerCase(), number: String(number) }};
            await usersDao.updateUserById(id, updatedUser);
            return res.status(200).send({ message: "Usuario actualizado con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeImage = async(req, res) => {
        try {
            
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteUserById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getUserById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            await usersDao.deleteUserById(id);
            return res.status(200).send({ message: "Usuario eliminado con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllUsers = async(req, res) => {
        try {
            await usersDao.deleteAllUsers();
            const users = await usersDao.getUsers();
            return res.status(200).send({ message: "Todos los usuarios eliminados con exito..", users });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};