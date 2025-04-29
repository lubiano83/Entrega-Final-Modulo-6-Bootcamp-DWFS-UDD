import RecordsDao from "../dao/records.dao.js";

const recordsDao = new RecordsDao();

export default class RecordsControllers {

    getRecords = async(req, res) => {
        try {
            const { lodge, user, people, arrive, leave, price, page = 1, limit = 10 } = req.query;
            const filters = {};
            if(lodge) filters.lodge = lodge;
            if(user) filters.user = user;
            if(people) filters.people = Number(people);
            if(price) filters.price = Number(price);
            
            const result = await recordsDao.paginate(filters, { page: parseInt(page), limit: parseInt(limit) });
            let records = result.docs;

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

            const totalSales = records.reduce((sum, record) => sum + record.price, 0);

            return res.status(200).send({ message: "Todos los registros..", payload: records, items: result.totalDocs, total: totalSales, limit: result.limit, page: result.page, totalPages: result.totalPages });
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
            return res.status(200).send({ message: "Registro eliminado con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllRecords = async(req, res) => {
        try {
            await recordsDao.deleteAll();
            return res.status(200).send({ message: "Todos los registros eliminados con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};