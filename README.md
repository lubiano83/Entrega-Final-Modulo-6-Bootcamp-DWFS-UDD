# 🏡 Sistema de Reservas de Cabañas
Este es un sistema de reservas de cabañas desarrollado con Node.js y Express.js, que permite gestionar cabañas, reservas y registros de pago mediante una API RESTful. Utiliza archivos JSON como base de datos local y cuenta con documentación interactiva mediante Swagger.

## 🚀 Características Principales

- 🔧 CRUD completo de cabañas, reservas y registros de pago.
- 🔎 Filtros y ordenamiento por fechas, usuarios, capacidad, precio, etc.
- ✅ Validación de disponibilidad y capacidad antes de reservar.
- 💰 Cálculo automático de precio según temporada (alta, media, baja).
- 📧 Envío de confirmación de reserva al correo electrónico del usuario con Nodemailer.
- 📅 Manejo flexible de temporadas desde el panel de API.
- 📄 Documentación de la API generada con Swagger UI.

## 🛠️ Tecnologías Utilizadas

- Node.js
- Express.js
- Swagger UI
- Nodemailer

⚙️ Configuración

Clona el repositorio y ejecuta:
- npm install

## 📁 Rutas de la API

### 🗓️ Temporadas (`/api/seasons`)
- `GET /api/seasons` → Obtener temporadas configuradas.
- `POST /api/seasons` → Crear o actualizar las temporadas (alta, media, baja).

---

### 🏡 Cabañas (`/api/lodges`)
- `GET /api/lodges` → Obtener todas las cabañas con filtros y ordenamiento.
- `POST /api/lodges` → Crear una nueva cabaña.
- `DELETE /api/lodges` → Eliminar todas las cabañas.
- `GET /api/lodges/:id` → Obtener una cabaña por ID.
- `PUT /api/lodges/:id` → Actualizar una cabaña por ID.
- `PATCH /api/lodges/:id` → Agregar imagen a una cabaña.
- `DELETE /api/lodges/:id` → Eliminar una cabaña por ID.
- `DELETE /api/lodges/image/:id` → Eliminar todas las imágenes de una cabaña.
- `PATCH /api/lodges/available/:id` → Cambiar la disponibilidad de una cabaña.

---

### 📆 Reservas (`/api/reservations`)
- `GET /api/reservations` → Obtener todas las reservas con filtros y ordenamiento.
- `POST /api/reservations/:lodgeId/:userId` → Crear una nueva reserva (envía email de confirmación).
- `DELETE /api/reservations` → Eliminar todas las reservas.
- `GET /api/reservations/:id` → Obtener una reserva por ID.
- `DELETE /api/reservations/:id` → Eliminar una reserva por ID.
- `PUT /api/reservations/:id` → Actualizar información general de la reserva.
- `PATCH /api/reservations/:id` → Cambiar estado de pago de una reserva.

---

### 📋 Registros (`/api/records`)
- `GET /api/records` → Obtener todos los registros de pagos confirmados.
- `DELETE /api/records` → Eliminar todos los registros.
- `GET /api/records/:id` → Obtener un registro por ID.
- `DELETE /api/records/:id` → Eliminar un registro por ID.

---

### 👤 Sesiones y Autenticación (`/api/sessions`)
- `GET /api/sessions/registered` → Obtener cantidad de usuarios registrados.
- `GET /api/sessions/logged` → Obtener cantidad de usuarios actualmente logueados.
- `POST /api/sessions/register` → Registrar un nuevo usuario.
- `POST /api/sessions/login` → Iniciar sesión de usuario.
- `POST /api/sessions/logout` → Cerrar sesión de usuario.

---

### 👥 Usuarios (`/api/users`)
- `GET /api/users` → Obtener listado de todos los usuarios.
- `GET /api/users/:id` → Obtener un usuario por ID.
- `PUT /api/users/:id` → Actualizar datos de un usuario por ID.
- `DELETE /api/users/:id` → Eliminar un usuario por ID.
- `PATCH /api/users/image/:id` → Subir o cambiar imagen de perfil del usuario (conversión a WebP).
- `PATCH /api/users/role/:id` → Cambiar el rol del usuario (admin, user, etc.).
- `DELETE /api/users/delete/all` → Eliminar todos los usuarios de la base de datos.

---

✅ Todas las rutas utilizan controladores separados por entidad, con validaciones y middlewares de autenticación (passport) para proteger endpoints sensibles.


## 📘 Documentación con Swagger

La documentación de la API está disponible en:

http://localhost:8080/api/docs

## ❗ Manejo de Errores

- 400 Bad Request → Datos faltantes o incorrectos.
- 404 Not Found → Recurso no encontrado.
- 500 Internal Server Error → Error inesperado en el servidor.

## 🌐 Producción

Servidor desplegado en Render:

🔗 https://entrega-final-modulo-6-bootcamp-dwfs-udd.onrender.com