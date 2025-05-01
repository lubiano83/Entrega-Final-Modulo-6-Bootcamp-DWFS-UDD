import transporter from "../config/nodemailer.config.js";
import moment from "moment";

export const sendReservationEmail = async (reservation) => {
    try {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/portfolio-3e2be.appspot.com/o/lasTrancasLodges%2Flogo.webp?alt=media&token=0c5d44ca-1507-4765-b55e-6209e6041bf5`;
        const mailOptions = {
            from: `"Reservas Cabañas" <${process.env.MAIL_USER}>`,
            to: reservation.email,
            subject: "Confirmación de Reserva",
            html: `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0px 30px 0px 30px;">
                    <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
                        <img src="${imageUrl}" alt="Logo Cabañas" style="width: 200; height: auto;">
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: start;">
                        <h2>Hola ${reservation.name}, tu reserva ha sido confirmada.</h2>
                        <p><strong>Fecha de llegada:</strong> ${moment(reservation.arrive).format("DD/MM/YYYY")} desde las 16:00 hrs.</p>
                        <p><strong>Fecha de salida:</strong> ${moment(reservation.leave).format("DD/MM/YYYY")} a las 12:00 hrs maximo.</p>
                        <p><strong>Cabaña:</strong> ${reservation.lodge}</p>
                        <p><strong>Personas:</strong> ${reservation.people}</p>
                        <p><strong>Total a pagar:</strong> $${reservation.price}</p>
                        <p><strong>Contaco:</strong> ${reservation.contact}</p>
                    </div>
                    <p>Gracias por elegirnos. ¡Esperamos verte pronto!</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error.message };
    }
};