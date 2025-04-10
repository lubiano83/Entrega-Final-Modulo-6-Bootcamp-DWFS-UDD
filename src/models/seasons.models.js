import mongoose from "mongoose";
import moment from "moment";

const collection = "seasons";

const seasonSchema = new mongoose.Schema({
        highSeasonStart: {
            type: Date,
            required: true,
            trim: true,
            set: value => moment(value, "DD/MM/YYYY").toDate()
        },
        highSeasonEnd: {
            type: Date,
            required: true,
            trim: true,
            set: value => moment(value, "DD/MM/YYYY").toDate()
        },
        midSeasonStart: {
            type: Date,
            required: true,
            trim: true,
            set: value => moment(value, "DD/MM/YYYY").toDate()
        },
        midSeasonEnd: {
            type: Date,
            required: true,
            trim: true,
            set: value => moment(value, "DD/MM/YYYY").toDate()
        }
});

const SeasonModel = mongoose.models[collection] || mongoose.model(collection, seasonSchema);
export default SeasonModel;