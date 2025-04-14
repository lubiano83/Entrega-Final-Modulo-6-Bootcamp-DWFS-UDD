import RecordsDao from "../dao/records.dao.js";

const recordsDao = new RecordsDao();

export default class RecordsControllers {

    getRecords = async(req, res) => {
        try {
            const { lodge, user, people, arrive, leave, price } = req.query;
            let records = await recordsDao.gets();
            if(lodge) records = records.filter(item => String(item.lodge) === lodge);
            if(user) records = records.filter(item => String(item.user) === user);
            if(people) records = records.filter(item => item.people === Number(people));
            if(price) records = records.filter(item => item.price === Number(price));

            if (arrive === "asc" || arrive === "desc") {
                records.sort((a, b) => {
                    const dateA = new Date(a.arrive);
                    const dateB = new Date(b.arrive);
                    return arrive === "asc" ? dateA - dateB : dateB - dateA;
                });
            };

            if (leave === "asc" || leave === "desc") {
                records.sort((a, b) => {
                    const dateA = new Date(a.leave);
                    const dateB = new Date(b.leave);
                    return leave === "asc" ? dateA - dateB : dateB - dateA;
                });
            };

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