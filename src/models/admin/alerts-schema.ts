// write down a schema for the alerts table
import { Schema, model, Types } from "mongoose";

const AlertSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
        // ref: "clients",
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['clients', 'therapist']
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

export const AlertModel = model("Alerts", AlertSchema);
