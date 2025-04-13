import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collection = "reservations";

const reservationsSchema = new mongoose.Schema({
    lodgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lodges"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    people: {
        type: Number,
        required: true,
    },
    arrive: {
        type: Date,
        required: true,
        trim: true
    },
    leave: {
        type: Date,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    paid: {
        type: Boolean,
        default: false
    }
});

reservationsSchema.plugin(paginate);

const ReservationModel = mongoose.models[collection] || mongoose.model(collection, reservationsSchema);
export default ReservationModel;