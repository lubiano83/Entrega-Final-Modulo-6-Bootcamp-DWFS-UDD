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
          return res.status(500).json({ message: "Error al obtener datos desde el servidor.", error: error.message });
        }
    };

    createLodge = async(req, res) => {
        try {
            const { hotel, size, bedroom, bathroom, capacity, season, available } = req.body;
            const { high, medium, low } = season;
            const lodgeCreated = { hotel: hotel.toLowerCase(), size: Number(size), bedroom: Number(bedroom), bathroom: Number(bathroom), capacity: Number(capacity), season: { high: Number(high), medium: Number(medium), low: Number(low) }, available: Boolean(available) };
            await lodgesDao.createLodge(lodgeCreated);
            return res.status(200).send({ message: "Lodge creado con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllLodges = async(req, res) => {
        try {
            await lodgesDao.deleteAllLodges();
            return res.status(200).send({ message: "Todos los lodges eliminados con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    }; 

};