import RecordsDao from "../dao/records.dao.js";

const recordsDao = new RecordsDao();

export default class RecordsControllers {

    getRecords = async(req, res) => {
        try {
            const records = await recordsDao.gets();
            return res.status(200).send({ message: "Todos los registros..", payload: records });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getRecordById = async(req, res) => {
        try {
            const { id } = req.params;
            const record = await recordsDao.getById(id);
            if(!record) return res.status(404).send({ message: "Registro no encontrado.." });
            return res.status(200).send({ message: "Registro obtenido por el id..", payload: record });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteRecordById = async(req, res) => {
        try {
            const { id } = req.params;
            const record = await recordsDao.getById(id);
            if(!record) return res.status(404).send({ message: "Registro no encontrado.." });
            await recordsDao.deleteById(id);
            return res.status(200).send({ message: "Registro eliminado.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllRecords = async(req, res) => {
        try {
            await recordsDao.deleteAll();
            return res.status(200).send({ message: "Todos los registros eliminados.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};