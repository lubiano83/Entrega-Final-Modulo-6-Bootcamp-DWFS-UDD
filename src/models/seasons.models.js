import mongoose from "mongoose";

const collection = "seasons";

const seasonSchema = new mongoose.Schema({
    highSeasonStart: {
        type: Date,
        required: true,
        trim: true
    },
    highSeasonEnd: {
        type: Date,
        required: true,
        trim: true
    },
    midSeasonStart: {
        type: Date,
        required: true,
        trim: true
    },
    midSeasonEnd: {
        type: Date,
        required: true,
        trim: true
    }
});

const SeasonModel = mongoose.models[collection] || mongoose.model(collection, seasonSchema);
export default SeasonModel;