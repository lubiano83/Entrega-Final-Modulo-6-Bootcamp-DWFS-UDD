import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collection = "lodges";

const lodgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    image: {
        type: Array,
        default: []
    },
    hotel: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        required: true,
        trim: true
    },
    bedroom: {
        type: Number,
        required: true,
        trim: true
    },
    bathroom: {
        type: Number,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        trim: true
    },
    wifi: {
        type: Boolean,
        default: false
    },
    season: {
        high: {
            type: Number,
            required: true,
            trim: true
        },
        medium: {
            type: Number,
            required: true,
            trim: true
        },
        low: {
            type: Number,
            required: true,
            trim: true
        }
    },
    available: {
        type: Boolean,
        default: false
    },
    reservations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reservations"
        }
    ],
    mapUrl: {
        type: String,
        default: ""
    }
}, { timestamps: true });

lodgeSchema.plugin(paginate);

const LodgeModel = mongoose.models[collection] || mongoose.model(collection, lodgeSchema);
export default LodgeModel;