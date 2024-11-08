import mongoose from "mongoose";

const attachementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        // ref: 'clients',
        refPath : 'userType',
        required: true
    },
    userType:{
        type: String,
        required: true,
        enum: ['clients', 'therapists']
    },
    title: {
        type: String,
        required: true
    },
    attachmemts: [String],
    assignedBy: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const attachementModel = mongoose.model("attachments", attachementSchema)