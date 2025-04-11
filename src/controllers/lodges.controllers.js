import LodgesDao from "../dao/lodges.dao.js";

const lodgesDao = new LodgesDao();

export default class LodgesControllers {

    getLodges = async(req, res) => {
        try {
            const { hotel, size, bedroom, bathroom, capacity, wifi, high, medium, low, available } = req.query;
            const reservas = await lodgesDao.getLodges();
            let filteredReservas = reservas;
            if (hotel) filteredReservas = filteredReservas.filter(item => item.hotel === hotel.toLowerCase().trim());
            if (size) filteredReservas = filteredReservas.filter(item => item.size === Number(size));
            if (bedroom) filteredReservas = filteredReservas.filter(item => item.bedroom === Number(bedroom));
            if (bathroom) filteredReservas = filteredReservas.filter(item => item.bathroom === Number(bathroom));
            if (capacity) filteredReservas = filteredReservas.filter(item => item.capacity === Number(capacity));
            if (high) filteredReservas = filteredReservas.filter(item => item.season.high === Number(high));
            if (medium) filteredReservas = filteredReservas.filter(item => item.season.medium === Number(medium));
            if (low) filteredReservas = filteredReservas.filter(item => item.season.low === Number(low));

            if (wifi !== undefined) {
                const wifiBool = wifi.toLowerCase() === "true";
                filteredReservas = filteredReservas.filter(item => item.wifi === wifiBool);
            }
            
            if (available !== undefined) {
                const availableBool = available.toLowerCase() === "true";
                filteredReservas = filteredReservas.filter(item => item.available === availableBool);
            }

            return res.status(200).send({ message: "Todos los Lodges..", payload: filteredReservas });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getLodgeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            return res.status(200).send({ message: "Lodge obtenido por el id..", payload: lodge });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    createLodge = async(req, res) => {
        try {
            const { hotel, size, bedroom, bathroom, capacity, season } = req.body;
            const { high, medium, low } = season;
            if(!hotel || !size || !bedroom || !bathroom || !capacity || !high || !medium || !low) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const lodgeCreated = { hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), season: { high: Number(high), medium: Number(medium), low: Number(low) } };
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            await lodgesDao.createLodge(lodgeCreated);
            return res.status(201).send({ message: "Lodge creado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    addImageToLodge = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const { image } = req.body;
            if(!image) return res.status(400).send({ message: "El campo image es requerido.." });
            lodge.image.push(image);
            await lodgesDao.updateLodgeById(id, { image: lodge.image });
            return res.status(200).send({ message: "Imagen agregada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllImageFromLodge = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            lodge.image = [];
            await lodgesDao.updateLodgeById(id, { image: lodge.image });
            return res.status(200).send({ message: "Imagenes eliminadas con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateLogdeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const { hotel, size, bedroom, bathroom, capacity, wifi, season } = req.body;
            const { high, medium, low } = season;
            if(!hotel || !size || !bedroom || !bathroom || !capacity || !wifi || !high || !medium || !low) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const updatedWifi = String(wifi).toLowerCase().trim() === "true" ? true : String(wifi).toLowerCase().trim() === "false" ? false : wifi;
            if(typeof updatedWifi !== "boolean") return res.status(400).send({ message: "El campo wifi debe ser true o false.." });
            const updatedLodge = { hotel: hotel.toLowerCase().trim(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), wifi: updatedWifi, season: { high: Number(high), medium: Number(medium), low: Number(low) }};
            if(isNaN(Number(size)) || isNaN(Number(bedroom)) || isNaN(Number(bathroom)) || isNaN(Number(capacity)) || isNaN(Number(high)) || isNaN(Number(medium)) || isNaN(Number(low))) return res.status(400).send({ message: "El campo: size, bedrrom, bathrrom, capacity, high, medium, low, deben ser tipo numero.." });
            await lodgesDao.updateLodgeById(id, updatedLodge);
            return res.status(200).send({ message: "Lodge actualizado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    changeAvailableById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            const changeAvailable = { available: !lodge.available };
            await lodgesDao.updateLodgeById(id, changeAvailable);
            return res.status(200).send({ message: "Available cambiado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteLodgeById = async(req, res) => {
        try {
            const { id } = req.params;
            const lodge = await lodgesDao.getLodgesById(id);
            if(!lodge) return res.status(404).send({ message: "Ese lodge no existe.." });
            await lodgesDao.deleteLodgeById(id);
            return res.status(200).send({ message: "Lodge eliminado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllLodges = async(req, res) => {
        try {
            await lodgesDao.deleteAllLodges();
            return res.status(200).send({ message: "Todos los lodges eliminados con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    }; 

};