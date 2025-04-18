import UsersDao from "../dao/users.dao.js";
import SeasonsDao from "../dao/seasons.dao.js";
import LodgesDao from "../dao/lodges.dao.js";
import ReservationsDao from "../dao/reservations.dao.js";
import RecordsDao from "../dao/records.dao.js";
import { sendReservationEmail } from "../utils/nodemailer.utils.js";

const usersDao = new UsersDao();
const seasonsDao = new SeasonsDao();
const lodgesDao = new LodgesDao();
const reservationsDao = new ReservationsDao();
const recordsDao = new RecordsDao();

export default class ReservationsController {

    #getPricePerDay = async(date, lodgeId) => {
        try {
            const lodge = await lodgesDao.getById(lodgeId);
            const year = date.getFullYear();
            const seasons = await seasonsDao.gets();
            if(seasons.length === 0) throw new Error("Primero debes establecer las temporadas..");
            const highSeasonStart = new Date(year, seasons[0].highSeasonStart.month - 1, seasons[0].highSeasonStart.day);
            const highSeasonEnd = new Date(year, seasons[0].highSeasonEnd.month - 1, seasons[0].highSeasonEnd.day);
            const midSeasonStart = new Date(year, seasons[0].midSeasonStart.month - 1, seasons[0].midSeasonStart.day);
            const midSeasonEnd = new Date(year + 1, seasons[0].midSeasonEnd.month - 1, seasons[0].midSeasonEnd.day);
            if (date >= highSeasonStart && date < highSeasonEnd) return lodge.season.high;
            if (date >= midSeasonStart && date < midSeasonEnd) return lodge.season.medium;
            return lodge.season.low;
        } catch (error) {
            throw new Error(error.message);
        }
    };
    
    #calculateTotalPrice = async(arrive, leave, lodgeId) => {
        try {
            let totalPrice = 0;
            let currentDate = new Date(arrive);
            const endDate = new Date(leave);
            while (currentDate < endDate) {
                totalPrice += await this.#getPricePerDay(currentDate, lodgeId);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return totalPrice;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    #confirmReservationDate = async (modifiedData, lodgeId) => {
        try {
            const reservationsList = await reservationsDao.gets();
            if(reservationsList.length === 0) return false;
            const existingReservations = reservationsList.filter(item => String(item.lodge._id) === lodgeId);
            const conflict = existingReservations.some(reservation => {
                const reservationStart = new Date(reservation.arrive);
                const reservationEnd = new Date(reservation.leave);
                return (
                    (modifiedData.arrive >= reservationStart && modifiedData.arrive < reservationEnd) ||
                    (modifiedData.leave > reservationStart && modifiedData.leave <= reservationEnd) ||
                    (modifiedData.arrive <= reservationStart && modifiedData.leave >= reservationEnd)
                );
            });
            return conflict;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    getReservations = async(req, res) => {
        try {
            const { lodge, user, people, arrive, leave, price, page = 1, limit = 10 } = req.query;
            const filters = {};
            if(lodge) filters.lodge = lodge;
            if(user) filters.user = user;
            if(people) filters.people = Number(people);
            if(price) filters.price = Number(price);

            const result = await reservationsDao.paginate(filters, { page: parseInt(page), limit: parseInt(limit) });
            let reservations = result.docs;

            if (arrive === "asc" || arrive === "desc") {
                reservations.sort((a, b) => {
                    const dateA = new Date(a.arrive);
                    const dateB = new Date(b.arrive);
                    return arrive === "asc" ? dateA - dateB : dateB - dateA;
                });
            };

            if (leave === "asc" || leave === "desc") {
                reservations.sort((a, b) => {
                    const dateA = new Date(a.leave);
                    const dateB = new Date(b.leave);
                    return leave === "asc" ? dateA - dateB : dateB - dateA;
                });
            };
            
            return res.status(200).send({ message: "Todas las reservas..", payload: reservations, items: result.totalDocs, limit: result.limit, page: result.page, totalPages: result.totalPages });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    getReservationById = async(req, res) => {
        try {
            const { id } = req.params;
            const reservation = await reservationsDao.getById(id);
            if(!reservation) return res.status(404).send({ message: "Esa reserva no existe.." });
            return res.status(200).send({ message: "Reserva obtenida por el id..", payload: reservation });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    createReservation = async(req, res) => {
        try {
            const { userId, lodgeId } = req.params;
            const user = await usersDao.getById(userId);
            if(!user) return res.status(404).send({ message: "Usuario no econtrado.." });
            const { people, arrive, leave } = req.body;
            if( !people || !arrive || !leave ) return res.status(400).send({ message: "Todos los campos son requeridos.." });
            const lodge = await lodgesDao.getById(lodgeId);
            if(!lodge) return res.status(404).send({ message: "Cabaña no econtrada.." });
            let price = await this.#calculateTotalPrice(arrive, leave, lodgeId);
            const modifiedData = { user: userId, lodge: lodgeId, name: `${user.first_name} ${user.last_name}`, email: user.email, people: Number(people), arrive: new Date(arrive), leave: new Date(leave), price: Number(price), paid: false };
            if( isNaN(Number(people))) return res.status(400).send({ message: "El campo: people, debe ser tipo number.." });
            if(lodge.available === false) return res.status(400).send({ message: "Esa cabaña no esta disponible.." });
            if(modifiedData.people > lodge.capacity) return res.status(400).send({ message: `La capacidad maxima es de ${lodge.capacity} personas..` });
            const conflict = await this.#confirmReservationDate(modifiedData, lodgeId);
            if (conflict) return res.status(400).send({ message: "Esta cabaña ya está reservada en las fechas seleccionadas.." });
            const emailResponse = await sendReservationEmail(modifiedData);
            if (!emailResponse.success) return res.status(500).send({ message: "Reserva creada, pero hubo un error al enviar el email.", error: emailResponse.error });
            const reservation = await reservationsDao.create(modifiedData);
            await usersDao.updateById(userId, {$push: { reservations: reservation._id }});
            return res.status(201).send({ message: "Reserva creada con éxito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    updateReservationById = async(req, res) => {
        try {
            const { id } = req.params;
            const reservation = await reservationsDao.getById(id);
            if(!reservation) return res.status(404).send({ message: "Esa reserva no existe.." });
            const { lodge, people, arrive, leave } = req.body;
            const updatedReservation = { lodge: String(lodge), people: Number(people), arrive: new Date(arrive), leave: new Date(leave) };
            const conflict = await this.#confirmReservationDate(updatedReservation, updatedReservation.lodge);
            if (conflict) return res.status(400).send({ message: "Esta cabaña ya está reservada en las fechas seleccionadas.." });
            await reservationsDao.updateById(id, updatedReservation);
            return res.status(200).send({ message: "Reserva modificada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteReservationById = async(req, res) => {
        try {
            const { id } = req.params;
            const reservation = await reservationsDao.getById(id);
            if(!reservation) return res.status(404).send({ message: "Esa reserva no existe.." });
            const user = await usersDao.getById(reservation.user);
            const newArray = user.reservations.filter(item => item !== id);
            await usersDao.updateById(reservation.user, { reservations: newArray });
            await reservationsDao.deleteById(id);
            return res.status(200).send({ message: "Reserva eliminada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    deleteAllReservations = async(req, res) => {
        try {
            await reservationsDao.deleteAll();
            return res.status(200).send({ message: "Todas las reservas eliminadas.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

    isAlreadyPaid = async(req, res) => {
        try {
            const { id } = req.params;
            const reservation = await reservationsDao.getById(id);
            if(!reservation) return res.status(404).send({ message: "Esa reserva no existe.." });
            const recordData = { lodge: reservation.lodge, user: reservation.user, people: Number(reservation.people), arrive: new Date(reservation.arrive), leave: new Date(reservation.leave), price: Number(reservation.price), paid: !reservation.paid };
            await recordsDao.create(recordData);
            await reservationsDao.deleteById(id);
            return res.status(201).send({ message: "Reserva pagada con exito.." });
        } catch (error) {
            return res.status( 500 ).send({ message: "Error al obtener datos desde el servidor..", error: error.message });
        }
    };

};