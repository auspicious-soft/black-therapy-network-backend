import { Schema, model, Types } from "mongoose";

const AlertSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['clients', 'therapists', 'users', 'admin']
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
    type: {
        type: String,
        enum: ['task', 'appointment', 'alert'],  // 'alert' is for general alerts for admin only
        required: true
    }
},
    {
        timestamps: true,
})

AlertSchema.index({ userId: 1, userType: 1, message: 1, date: 1 }, { unique: true });

export const AlertModel = model("Alerts", AlertSchema)