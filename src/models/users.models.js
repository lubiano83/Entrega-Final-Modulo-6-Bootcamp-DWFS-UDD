import mongoose from "mongoose";
import moment from "moment";
import paginate from "mongoose-paginate-v2";

const collection = "users";

const userSchema = new mongoose.Schema({
    image: {
        type: String,
        default: ""
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
    lodges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "lodges"
        }
    ],
    reservations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reservations"
        }
    ],
    plan: {
        type: String,
        enum: [ "free", "premium", "gold" ],
        default: "free"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

userSchema.plugin(paginate);

const UserModel = mongoose.models[collection] || mongoose.model(collection, userSchema);
export default UserModel;