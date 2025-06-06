import passport from "passport";
import jwt from "passport-jwt";
import dotenv from "dotenv"

dotenv.config();
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const initializePassport = () => {
    passport.use("current", new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.COOKIE_KEY,
        //Misma palabra secreta que tenemos en App.js
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }));
};

const cookieExtractor = (req) => {
    let token = null;
    if(req && req.cookies) {
        token = req.cookies[process.env.COOKIE_NAME];
    }
    return token;
};

export default initializePassport;