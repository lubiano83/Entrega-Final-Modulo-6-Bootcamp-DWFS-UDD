import UsersDao from "../dao/users.dao.js";
import SessionsDao from "../dao/sessions.dao.js";
import { createHash, isValidPassword } from "../utils/bcrypt.utils.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const usersDao = new UsersDao();
const sessionsDao = new SessionsDao();

export default class UsersControllers {

    getUsers = async (req, res) => {
        try {
            const { email, country, state, city, street, role, reservations, createdAt, sort, page = 1, limit = 10 } = req.query;
            const filters = {};
            if (email) filters.email = email.toLowerCase().trim();
            if (role) filters.role = role.toLowerCase().trim();
            if (country) filters["address.country"] = country.toLowerCase().trim();
            if (state) filters["address.state"] = state.toLowerCase().trim();
            if (city) filters["address.city"] = city.toLowerCase().trim();
            if (street) filters["address.street"] = street.toLowerCase().trim();
            if (createdAt) filters.createdAt = new Date(createdAt);

            const result = await usersDao.paginate(filters, { page: parseInt(page), limit: parseInt(limit) });
            let users = result.docs;
    
            if (reservations) {
                const sortOrder = reservations.toLowerCase().trim();
                if (sortOrder === 'asc') {
                    users.sort((a, b) => b.reservations.length - a.reservations.length);
                } else if (sortOrder === 'desc') {
                    users.sort((a, b) => a.reservations.length - b.reservations.length);
                }
            }
    
            if (sort) {
                const sortOrder = sort.toLowerCase().trim();
                if (sortOrder === 'asc') {
                    users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                } else if (sortOrder === 'desc') {
                    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
            }
    
            return res.status(200).send({ message: "Todos los usuarios..", payload: users, items: result.totalDocs, limit: result.limit, page: result.page, totalPages: result.totalPages });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener usuarios desde el servidor..", error: error.message });
        }
    };    

    getUserById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            return res.status(200).send({ message: "Usuario obtenido por el id..", payload: user });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    registerUser = async (req, res) => {
        try {
            const { first_name, last_name, email, phone, password, address } = req.body;
            const { country, state, city, street, number } = address;
            if (!first_name || !last_name || !phone || !email || !password || !country || !state || !city || !street || !number) return res.status(400).json({ message: "Todos los campos son requeridos.." });
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).send({ message: "Debes ingresar un email válido.." });
            const phoneRegex = /^\+569\d{8}$/;
            if (!phoneRegex.test(phone)) return res.status(400).send({ message: "Debes ingresar un telefono válido.." });
            const existingUser = await usersDao.getByProperty({ email: email.toLowerCase().trim() });
            if (existingUser.length > 0) return res.status(409).send({ message: "Ese email ya está registrado.." });
            if (String(password).trim().length < 6 || String(password).trim().length > 8) return res.status(409).send({ message: "La contraseña debe tener entre 6 y 8 caracteres.." });
            const newUser = { first_name: first_name.toLowerCase().trim(), last_name: last_name.toLowerCase().trim(), phone: String(phone), email: email.toLowerCase().trim(), password: await createHash(String(password).trim()), address: { country: country.toLowerCase().trim(), state: state.toLowerCase().trim(), city: city.toLowerCase().trim(), street: street.toLowerCase().trim(), number: String(number).trim() }};
            if(isNaN(Number(number))) return res.status(400).send({ message: "El campo number debe ser tipo numero.." });
            await usersDao.create(newUser);
            return res.status(201).send({ message: "Usuario registrado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    loginUser = async( req, res ) => {
        try {
            const { email, password } = req.body;
            if( !email || !password ) return res.status( 400 ).send({ message: "Todos los campos son requeridos.." });
            const users = await usersDao.getByProperty({ email: email.toLowerCase().trim() });
            if( users.length === 0 ) return res.status( 404 ).send({ message: "Ese email no esta registrado.." });
            const passwordMatch = await isValidPassword(users[0], String(password).trim());
            if ( !passwordMatch ) return res.status( 401 ).send({ status: 401, message: "La contraseña es incorrecta.." });
            const userLogged = req.cookies[ process.env.COOKIE_NAME ];
            if ( userLogged ) return res.status( 409 ).send({ message: "Ese usuario ya está logeado.." });
            const token = jwt.sign({ email: users[0].email.toLowerCase(), first_name: users[0].first_name.toLowerCase(), last_name: users[0].last_name.toLowerCase(), phone: users[0].phone, role: users[0].role.toLowerCase(), id: users[0]._id.toString() }, process.env.COOKIE_KEY, { expiresIn: "1h" });
            res.cookie( process.env.COOKIE_NAME, token, { maxAge: 3600000, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none", path: "/" });
            await sessionsDao.create(users[0]._id, token);
            return res.status( 200 ).send({ message: "Login realizado con éxito", token });
        } catch ( error ) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    logoutUser = async(req, res) => {
        try {
            const token = req.cookies[process.env.COOKIE_NAME];
            if (!token) return res.status(401).send({ message: "Token no encontrado, sesión cerrada.." });
            res.clearCookie(process.env.COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none", path: "/" });
            await sessionsDao.delete(token);
            return res.status(200).send({ message: "Logout realizado con éxito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateUserById = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            const { first_name, last_name, phone, address } = req.body;
            const { country, state, city, street, number } = address;
            if( !first_name || !last_name || !phone || !country || !state || !city || !street || !number ) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const updatedUser = { first_name: first_name.toLowerCase().trim(), last_name: last_name.toLowerCase().trim(), address: { country: country.toLowerCase().trim(), state: state.toLowerCase().trim(), city: city.toLowerCase().trim(), street: street.toLowerCase().trim(), number: String(number).trim() }, updatedAt: new Date()};
            if(isNaN(Number(number))) return res.status(400).send({ message: "El campo number debe ser tipo numero.." });
            await usersDao.updateById(id, updatedUser);
            return res.status(200).send({ message: "Usuario actualizado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeImageById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            if (!req.file) return res.status(400).send({ message: "No se ha subido ninguna imagen.." });
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            let oldFilename = user.image;
            if (oldFilename && oldFilename.startsWith("http")) oldFilename = oldFilename.split("/").pop();
            if (oldFilename && oldFilename !== "user-circle-svgrepo-com.svg") {
                const oldImagePath = path.join(process.cwd(), "src/public/profile", oldFilename);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            };
            const changedImage = { image: `${baseUrl}/${req.file.filename}` };
            await usersDao.updateById(id, changedImage);
            return res.status(200).send({ message: "Imagen cambiada con éxito." });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor.", error: error.message });
        }
    };

    changeRoleById = async(req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const user = await usersDao.getById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            const newRole = role.toLowerCase().trim();
            const validRoles = ["user", "admin", "developer"];
            if (!validRoles.includes(newRole)) return res.status(400).send({ message: "Ese role no está habilitado.." });
            const modifiedRole = { role: newRole.toLowerCase().trim() };
            await usersDao.updateById(id, modifiedRole);
            return res.status(200).send({ message: "Role actualizado con exito.." });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor.", error: error.message });
        }
    }; 

    deleteUserById = async(req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getById(id);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            if (user.image && !user.image.includes("user-circle-svgrepo-com.svg")) {
                let filename = user.image;
                if (filename.startsWith("http")) filename = filename.split("/").pop();
                const imagePath = path.join(process.cwd(), "src/public/profile", filename);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            };
            await usersDao.deleteById(id);
            return res.status(200).send({ message: "Usuario eliminado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllUsers = async(req, res) => {
        try {
            const users = await usersDao.gets();
            users.forEach(user => {
                if (user.image && !user.image.includes("user-circle-svgrepo-com.svg")) {
                    let filename = user.image;
                    if (filename.startsWith("http")) filename = filename.split("/").pop();
                    const imagePath = path.join(process.cwd(), "src/public/profile", filename);
                    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                }
            });
            await usersDao.deleteAll();
            return res.status(200).send({ message: "Todos los usuarios eliminados con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    usersRegistered = async( req, res ) => {
        try {
            const users = await usersDao.gets();
            const usersRegistered = users.length;
            return res.status( 200 ).send({ payload: usersRegistered });
        } catch ( error ) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    usersLogged = async( req, res ) => {
        try {
            const users = await sessionsDao.gets();
            const usersOnline = users.length;
            return res.status( 200 ).send({ payload: usersOnline });
        } catch ( error ) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};