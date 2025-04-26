import LodgesDao from "../dao/lodges.dao.js";
import UsersDao from "../dao/users.dao.js";

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
            if(!user) return res.status(400).send({ message: "El userId ingresado no existe.." });
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
            const lodgeCreated = { userId: String(userId), hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), season: { high: Number(high), medium: Number(medium), low: Number(low) } };
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            await lodgesDao.create(lodgeCreated);
            return res.status(201).send({ message: "Lodge creado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    addImageToLodge = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const { image } = req.body;
            if(!image) return res.status(400).send({ message: "El campo image es requerido.." });
            lodge.image.push(image);
            await lodgesDao.updateById(id, { image: lodge.image });
            return res.status(200).send({ message: "Imagen agregada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllImageFromLodge = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            lodge.image = [];
            await lodgesDao.updateById(id, { image: lodge.image });
            return res.status(200).send({ message: "Imagenes eliminadas con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateLogdeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const { hotel, size, bedroom, bathroom, capacity, wifi, season } = req.body;
            const { high, medium, low } = season;
            if(!hotel || !size || !bedroom || !bathroom || !capacity || !wifi || !high || !medium || !low) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const updatedWifi = String(wifi).toLowerCase().trim() === "true" ? true : String(wifi).toLowerCase().trim() === "false" ? false : wifi;
            if(typeof updatedWifi !== "boolean") return res.status(400).send({ message: "El campo wifi debe ser true o false.." });
            const updatedLodge = { hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), wifi: updatedWifi, season: { high: Number(high), medium: Number(medium), low: Number(low) }};
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            await lodgesDao.updateById(id, updatedLodge);
            return res.status(200).send({ message: "Lodge actualizado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeAvailableById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
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