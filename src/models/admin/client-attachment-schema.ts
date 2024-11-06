import mongoose from "mongoose";

const clientAttachmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'clients',
        required: true
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

export const clientAttachmentModel = mongoose.model("client-attachments", clientAttachmentSchema)