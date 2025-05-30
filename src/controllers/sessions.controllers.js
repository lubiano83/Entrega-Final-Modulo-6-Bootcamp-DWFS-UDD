import SessionsDao from "../dao/sessions.dao.js";
import UsersDao from "../dao/users.dao.js";
import { createHash, isValidPassword } from "../utils/bcrypt.utils.js";
import jwt from "jsonwebtoken";
import { sendPasswordEmail } from "../utils/nodemailer.utils.js";

const sessionsDao = new SessionsDao();
const usersDao = new UsersDao();

export default class SessionsControllers {

    #generateRandomPassword = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }
        return password;
    }

    getSessions = async(req, res) => {
        try {
            const sessions = await sessionsDao.gets();
            return res.status(200).send({ message: "Todas las Sesiones..", payload: sessions });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor.", error: error.message });
        }
    };

    getSessionById = async(req, res) => {
        try {
            const { userId } = req.params;
            const session = await sessionsDao.getById(userId);
            if(!session) return res.status(404).send({ message: "Sesion no encontrada.." });
            return res.status(200).send({ message: "sesion obtenida por el id..", payload: session });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor.", error: error.message });
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
            if(users[0].loginAttempts >= 3) return res.status(423).send({ message: "Tu cuenta a sido bloqueada, debes cambiar tu contraseña.." });
            const passwordMatch = await isValidPassword(users[0], String(password).trim());
            if ( !passwordMatch ) {
                users[0].loginAttempts++;
                await usersDao.updateById(users[0]._id, { loginAttempts: users[0].loginAttempts });
                return res.status( 401 ).send({ status: 401, message: "La contraseña es incorrecta.." });
            };
            const userLogged = req.cookies[ process.env.COOKIE_NAME ];
            if ( userLogged ) return res.status( 409 ).send({ message: "Ese usuario ya está logeado.." });
            const token = jwt.sign({ id: users[0]._id, email: users[0].email.toLowerCase(), first_name: users[0].first_name.toLowerCase(), last_name: users[0].last_name.toLowerCase(), phone: users[0].phone, role: users[0].role.toLowerCase(), id: users[0]._id.toString() }, process.env.COOKIE_KEY, { expiresIn: "1h" });
            res.cookie(process.env.COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 1000 * 60 * 60 });
            await sessionsDao.create(users[0]._id, token);
            await usersDao.updateById(users[0]._id, { loginAttempts: 0 });
            return res.status( 200 ).send({ message: "Login realizado con éxito", token });
        } catch ( error ) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    logoutUser = async(req, res) => {
        try {
            const token = req.cookies[process.env.COOKIE_NAME] || req.headers.authorization?.split(" ")[1];
            if (!token) return res.status(401).send({ message: "Token no encontrado, sesión cerrada.." });
            res.clearCookie(process.env.COOKIE_NAME, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 1000 * 60 * 60 });
            await sessionsDao.delete(token);
            return res.status(200).send({ message: "Logout realizado con éxito.." });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
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
            const sessions = await sessionsDao.gets();
            const usersOnline = sessions.length;
            return res.status( 200 ).send({ payload: usersOnline });
        } catch ( error ) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getCurrentSession = async(req, res) => {
        try {
            const token = req.cookies[process.env.COOKIE_NAME];
            if (!token) return res.status(401).send({ message: "No hay sesión activa.." });
            const session = await sessionsDao.getToken(token);
            if (!session) return res.status(401).send({ message: "Sesión no válida.." });
            const user = await usersDao.getById(session.userId._id);
            if (!user) return res.status(404).send({ message: "Usuario no encontrado.." });
            return res.status(200).send({ message: "Sesion encontrada con exito..", token });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    restartPasswordByEmail = async(req, res) => {
        try {
            const { email } = req.body;
            const user = await usersDao.getByProperty({ email });
            const password = this.#generateRandomPassword(8);
            await usersDao.updateById(user[0]._id, { password: await createHash(String(password).trim())});
            const sendPassword = await sendPasswordEmail(user[0], password);
            if(!sendPassword) return res.status(400).send({ message: "No se pudo restablecer la contraseña, intentalo nuevamente.." });
            await usersDao.updateById(user[0]._id, { loginAttempts: 0 });
            return res.status(201).send({ message: "Contraseña restablecida con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changePassword = async(req, res) => {
        try {
            const { email } = req.params;
            const { password, newPassword } = req.body;
            if (String(newPassword).trim().length < 6 || String(newPassword).trim().length > 8) return res.status(409).send({ message: "La contraseña debe tener entre 6 y 8 caracteres.." });
            const user = await usersDao.getByProperty({ email });
            if(user[0].loginAttempts >= 3) return res.status(423).send({ message: "Tu cuenta a sido bloqueada, debes cambiar tu contraseña.." });
            const passwordMatch = await isValidPassword(user[0], String(password).trim());
            if ( !passwordMatch ) {
                user[0].loginAttempts++;
                await usersDao.updateById(user[0]._id, { loginAttempts: user[0].loginAttempts });
                return res.status( 401 ).send({ status: 401, message: "La contraseña es incorrecta.." });
            };
            await usersDao.updateById(user[0]._id, { password: await createHash(String(newPassword).trim()), loginAttempts: 0 });
            return res.status(200).send({ message: "Tu contraseña a sido cambiada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllSessions = async(req, res) => {
        try {
            await sessionsDao.deleteAll();
            return res.status(200).send({ message: "Todas las sesiones eliminadas con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };
};