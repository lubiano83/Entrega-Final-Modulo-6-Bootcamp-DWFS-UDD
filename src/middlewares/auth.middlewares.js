//Hacemos una funcion que verifique que seas developer:
export function justDev(req, res, next) {
    if (!req.user) return res.status(401).send({ message: "No autenticado.." });
    if(req.user.role === "developer") return next();
    return res.status(403).send({ message: "Acceso denegado, solo developer.." });
}

//Hacemos una funcion que verifique que seas admin:
export function justChief(req, res, next) {
    if (!req.user) return res.status(401).send({ message: "No autenticado.." });
    if(req.user.role === "admin" || req.user.role === "developer") return next();
    return res.status(403).send({ message: "Acceso denegado, solo admin.." });
}

//Hacemos una funcion que verifique que seas user:
export function justUsers(req, res, next) {
    if (!req.user) return res.status(401).send({ message: "No autenticado.." });
    if(req.user.role === "user" || req.user.role === "admin" || req.user.role === "developer") return next();
    return res.status(403).send({ message: "Acceso denegado, solo users.." });
}