import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    roomId: { type: String, required: true },
    message: { type: String, required: true },
    attachments: { type: String, required: false }
}, {
    timestamps: true
})

export const MessageModel = mongoose.model('messages', messageSchema);
