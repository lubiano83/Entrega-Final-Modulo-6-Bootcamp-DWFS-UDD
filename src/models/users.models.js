import mongoose from "mongoose";
import moment from "moment";
import paginate from "mongoose-paginate-v2";

const collection = "users";

const userSchema = new mongoose.Schema({
    image: {
        type: String,
        default: "../public/user-circle-svgrepo-com.svg"
    },
    first_name: {
        type: String,
        trim: true,
        required: [true, 'El nombre es obligatorio'],
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, 'El apellido es obligatorio'],
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    password:{
        type: String,
        trim: true,
        required: true,
    },
    address: {
        country: { type: String, trim: true, required: true },
        state: { type: String, trim: true, required: true },
        city: { type: String, trim: true, required: true },
        street: { type: String, trim: true, required: true },
        number: { type: String, trim: true, required: true },
    },
    role: {
        type: String,
        enum: [ "user", "admin", "developer" ],
        default: "user"
    },
    reservations: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (value) => moment(value).format("DD/MM/YYYY") // Getter para formatear
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        get: (value) => moment(value).format("DD/MM/YYYY") // Getter para formatear
    }
}, { toJSON: { getters: true }, toObject: { getters: true } });

// Hook pre-save para formatear `updatedAt` antes de guardar
userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Hook pre-update para formatear `updatedAt` antes de una actualización
userSchema.pre("findOneAndUpdate", function (next) {
    this._update.updatedAt = Date.now();
    next();
});
  

userSchema.plugin(paginate);

const UserModel = mongoose.models[collection] || mongoose.model(collection, userSchema);
export default UserModel;