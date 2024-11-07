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
    },
    date: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
})

AlertSchema.index({ userId: 1, userType: 1, message: 1, date: 1 }, { unique: true });

export const AlertModel = model("Alerts", AlertSchema)