import UsersDao from "../dao/users.dao.js";
import SessionsDao from "../dao/sessions.dao.js";
import { bucket } from "../config/firebase.config.js";

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

    changeImageById = async (req, res) => {
      try {
        const { id } = req.params;
        const user = await usersDao.getById(id);
        if (!user) return res.status(404).send({ message: "Ese usuario no existe.." });
        if (!req.file) return res.status(400).send({ message: "No se ha subido ninguna imagen.." });
        if (user.image && user.image.includes("storage.googleapis.com")){
            try {
              const imageUrl = new URL(user.image);
              const pathInBucket = imageUrl.pathname.replace(`/${bucket.name}/`, "");
              const oldFile = bucket.file(pathInBucket);
              await oldFile.delete().catch(() => {});
            } catch (err) {
              console.warn("No se pudo eliminar la imagen anterior:", err.message);
            }
        };          

        const fileName = `profile/${Date.now()}-${req.file.originalname}`;
        const file = bucket.file(fileName);
        const stream = file.createWriteStream({
            metadata: {
                contentType: "image/webp",
            },
        });
    
        stream.end(req.file.buffer);
        stream.on("error", (err) => {
            console.error("Error al subir la imagen:", err);
            return res.status(500).send({ message: "Error al subir imagen a Firebase.", error: err.message });
        });
    
        stream.on("finish", async () => {
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            const changedImage = { image: publicUrl };
            await usersDao.updateById(id, changedImage);
            return res.status(200).send({ message: "Imagen cambiada con éxito.", imageUrl: publicUrl });
        });
    
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
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

    deleteUserById = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await usersDao.getById(id);
            if (!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            if (user.image && user.image.includes("storage.googleapis.com") && !user.image.includes("user-circle-svgrepo-com.svg")) {
                try {
                    const imageUrl = new URL(user.image);
                    const pathInBucket = imageUrl.pathname.replace(`/${bucket.name}/`, "");
                    const file = bucket.file(pathInBucket);
                    await file.delete();
                } catch (err) {
                    console.warn("No se pudo eliminar la imagen de Firebase Storage:", err.message);
                }
            };
            await usersDao.deleteById(id);
            return res.status(200).send({ message: "Usuario eliminado con éxito.." });
        } catch (error) {
          return res.status(500).send({ message: "Error al eliminar el usuario.", error: error.message });
        }
    };
          
    deleteAllUsers = async (req, res) => {
        try {
            const users = await usersDao.gets();
        
            for (const user of users) {
                if (user.image && user.image.includes("storage.googleapis.com") && !user.image.includes("user-circle-svgrepo-com.svg")) {
                    try {
                        const imageUrl = new URL(user.image);
                        const pathInBucket = imageUrl.pathname.replace(`/${bucket.name}/`, "");
                        const file = bucket.file(pathInBucket);
                        await file.delete();
                    } catch (err) {
                        return res.status(400).send({ message: "No se pudo eliminar la imagen de Firebase Storage.." });
                    }
                }
            }
        
            await usersDao.deleteAll();
            return res.status(200).send({ message: "Todos los usuarios eliminados con éxito." });
        } catch (error) {
            return res.status(500).send({ message: "Error al obtener datos desde el servidor.", error: error.message });
        }
    };

};