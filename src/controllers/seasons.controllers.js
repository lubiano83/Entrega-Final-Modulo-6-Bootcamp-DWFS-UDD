import SeasonsDao from "../dao/seasons.dao.js";

const seasonsDao = new SeasonsDao();

export default class SeasonsController {

    getSeasons = async(req, res) => {
        try {
            const seasons = await seasonsDao.getSeasons();
            return res.status(200).send({ message: "Todas las temporadas..", seasons });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    createSeason = async(req, res) => {
        try {
            await seasonsDao.deleteAllSeasons();
            const { highSeasonStart, highSeasonEnd, midSeasonStart, midSeasonEnd } = req.body;
            if(!highSeasonStart || !highSeasonEnd || !midSeasonStart || !midSeasonEnd) return res.status(404).send({ message: "Todos los campos son requeridos.." });
            const modifiedSeason = { highSeasonStart: String(highSeasonStart), highSeasonEnd: String(highSeasonEnd), midSeasonStart: String(midSeasonStart), midSeasonEnd: String(midSeasonEnd) };
            await seasonsDao.createSeason(modifiedSeason);
            return res.status(200).send({ message: "Temporada creada con exito.." });
        } catch (error) {
            return res.status( 500 ).json({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};