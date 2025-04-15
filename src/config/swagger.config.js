import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from "swagger-ui-express";

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentación de la App de Reservas de Cabañas",
            description: "App dedicada a la administración y reserva de cabañas para hospedaje."
        }
    },
    apis: ["./src/docs/*.yaml"]
}

const swaggerSpecs = swaggerJSDoc(swaggerOptions);
const swaggerServe = swaggerUiExpress.serve;
const swaggerSetup = swaggerUiExpress.setup(swaggerSpecs);

export { swaggerServe, swaggerSetup };