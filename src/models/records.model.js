import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collection = "records";

const recordSchema = new mongoose.Schema({
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
        trim: true,
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

recordSchema.plugin(paginate);

recordSchema.pre(/^find/, function (next) {
    this.populate("lodge").populate("user");
    next();
});

const RecordModel = mongoose.models[collection] || mongoose.model(collection, recordSchema);
export default RecordModel;