import mongoose from "mongoose";
import moment from "moment";

const collection = "sessions";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    token: {
        type: String,
        unique: true,
        required: true,
    },
}, { timestamps: true });

sessionSchema.pre(/^find/, function (next) {
    this.populate("userId")
    next();
});

const SessionModel = mongoose.models[collection] || mongoose.model(collection, sessionSchema);
export default SessionModel;