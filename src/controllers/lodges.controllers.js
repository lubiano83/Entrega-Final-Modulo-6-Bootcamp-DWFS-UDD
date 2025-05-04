import LodgesDao from "../dao/lodges.dao.js";
import UsersDao from "../dao/users.dao.js";
import { bucket } from "../config/firebase.config.js";

const lodgesDao = new LodgesDao();
const usersDao = new UsersDao();

export default class LodgesControllers {

    getLodges = async(req, res) => {
        try {
            const { hotel, size, bedroom, bathroom, capacity, wifi, high, medium, low, available, page = 1, limit = 10 } = req.query;
            const filters = {};
            if (hotel) filters.hotel = hotel;
            if (size) filters.size = Number(size);
            if (bedroom) filters.bedroom = Number(bedroom);
            if (bathroom) filters.bathroom = Number(bathroom);
            if (capacity) filters.capacity = Number(capacity);
            if (high) filters["season.high"] = Number(high);
            if (medium) filters["season.medium"] = Number(medium);
            if (low) filters["season.low"] = Number(low);
            
            const result = await lodgesDao.paginate(filters, { page: parseInt(page), limit: parseInt(limit) });
            let lodges = result.docs;

            if (wifi !== undefined) {
                const wifiBool = wifi.toLowerCase().trim() === "true";
                lodges = lodges.filter(item => item.wifi === wifiBool);
            }
            
            if (available !== undefined) {
                const availableBool = available.toLowerCase().trim() === "true";
                lodges = lodges.filter(item => item.available === availableBool);
            }

            return res.status(200).send({ message: "Todos los Lodges..", payload: lodges, items: result.totalDocs, limit: result.limit, page: result.page, totalPages: result.totalPages });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getLodgeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            return res.status(200).send({ message: "Lodge obtenido por el id..", payload: lodge });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getLodgesByUserId = async(req, res) => {
        try {
            const { userId } = req.params;
            const user = await usersDao.getById(userId);
            if(!user) return res.status(400).send({ message: "El id del usuario ingresado no existe.." });
            const lodges = await lodgesDao.getByProperty({ userId: userId });
            return res.status(200).send({ message: "Todos los lodges por el userId..", payload: lodges });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    createLodge = async(req, res) => {
        try {
            const { userId } = req.params;
            const { hotel, size, bedroom, bathroom, capacity, season } = req.body;
            const { high, medium, low } = season;
            if(!userId, !hotel || !size || !bedroom || !bathroom || !capacity || !high || !medium || !low) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const user = await usersDao.getById(userId);
            if(!user) return res.status(404).send({ message: "Ese usuario no existe.." });
            const lodgeCreated = { userId: String(userId), hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), season: { high: Number(high), medium: Number(medium), low: Number(low) } };
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            if(user.plan === "free" && user.lodges.length < 1) {
                const lodge = await lodgesDao.create(lodgeCreated);
                await usersDao.updateById(userId, {$push: { lodges: lodge._id}});
            } else if(user.plan === "premium" && user.lodges.length < 5) {
                const lodge = await lodgesDao.create(lodgeCreated);
                await usersDao.updateById(userId, {$push: { lodges: lodge._id }});
            } else if (user.plan === "gold" && user.lodges.length < 10) {
                const lodge = await lodgesDao.create(lodgeCreated);
                await usersDao.updateById(userId, {$push: { lodges: lodge._id }});
            } else {
                return res.status(400).send({ message: `Alcanzaste el maximo de cabañas que puedes crear con tu cuenta ${user.plan}..` });
            };
            return res.status(201).send({ message: "Lodge creado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    addImageToLodge = async (req, res) => {
        try {
          const { id } = req.params;
          const lodge = await lodgesDao.getById(id);
          if (!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
          if (!req.file) return res.status(400).send({ message: "No se ha subido ninguna imagen.." });
          if (lodge.image.length >= 5) return res.status(400).send({ message: "Has alcanzado el máximo de imágenes permitidas.." });
          const fileName = `lodges/${id}/${Date.now()}-${req.file.originalname}`;
          const file = bucket.file(fileName);
          const stream = file.createWriteStream({ metadata: { contentType: "image/webp" }});
          stream.end(req.file.buffer);
          stream.on("error", (err) => {
            console.error("Error al subir la imagen:", err);
            return res.status(500).send({ message: "Error al subir imagen a Firebase.", error: err.message });
          });
          stream.on("finish", async () => {
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            lodge.image.push(publicUrl);
            await lodgesDao.updateById(id, { image: lodge.image });
            return res.status(200).send({ message: "Imagen agregada con éxito.", imageUrl: publicUrl });
          });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };      

    deleteAllImageFromLodge = async (req, res) => {
        try {
          const { id } = req.params;
          const lodge = await lodgesDao.getById(id);
          if (!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
          const [files] = await bucket.getFiles({ prefix: `lodges/${id}/` });
          if (files.length > 0) {
            const deletePromises = files.map(file => file.delete());
            await Promise.all(deletePromises);
          }
          lodge.image = [];
          await lodgesDao.updateById(id, { image: lodge.image });
          const changeAvailable = { available: false };
          await lodgesDao.updateById(id, changeAvailable);
          return res.status(200).send({ message: "Imágenes eliminadas con éxito.." });
        } catch (error) {
          console.error("Error eliminando imágenes:", error.message);
          return res.status(500).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateLogdeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const { hotel, size, bedroom, bathroom, capacity, season, mapUrl } = req.body;
            const { high, medium, low } = season;
            if(!hotel || !size || !bedroom || !bathroom || !capacity || !high || !medium || !low || !mapUrl) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const updatedLodge = { hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), season: { high: Number(high), medium: Number(medium), low: Number(low) }, mapUrl: String(mapUrl) };
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            await lodgesDao.updateById(id, updatedLodge);
            return res.status(200).send({ message: "Lodge actualizado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeWifiById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const changeWifi = { wifi: !lodge.wifi };
            await lodgesDao.updateById(id, changeWifi);
            return res.status(200).send({ message: "Wifi cambiado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeAvailableById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            if(lodge.image.length === 0) return res.status(400).send({ message: "Debes tener al menos una imagen cargada.." });
            const changeAvailable = { available: !lodge.available };
            await lodgesDao.updateById(id, changeAvailable);
            return res.status(200).send({ message: "Available cambiado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteLodgeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const user = await usersDao.getById(lodge.userId);
            if(!user) return res.status(404).send({ message: "Usuario no encontrado.." });
            const lodgesModified = user.lodges.filter(lodge => lodge.toString() !== id)
            await usersDao.updateById(user._id, { lodges: lodgesModified });
            const [files] = await bucket.getFiles({ prefix: `lodges/${id}/` });
            if (files.length > 0) {
                const deletePromises = files.map(file => file.delete());
                await Promise.all(deletePromises);
            }
            lodge.image = [];
            await lodgesDao.updateById(id, { image: lodge.image });
            await lodgesDao.deleteById(id);
            return res.status(200).send({ message: "Lodge eliminado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllLodges = async(req, res) => {
        try {
            await lodgesDao.deleteAll();
            return res.status(200).send({ message: "Todos los lodges eliminados con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    }; 

};