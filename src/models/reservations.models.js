import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collection = "reservations";

const reservationSchema = new mongoose.Schema({
    lodge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lodges"
    },
    user: {
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
    },
    contact: {
        type: String,
        required: true
    }
}, { timestamps: true });

reservationSchema.plugin(paginate);

reservationSchema.pre(/^find/, function (next) {
    this.populate("lodge").populate("user");
    next();
});

const ReservationModel = mongoose.models[collection] || mongoose.model(collection, reservationSchema);
export default ReservationModel;