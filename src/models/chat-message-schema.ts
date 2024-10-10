import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, 
    roomId: { type: String, required: true },
    message: { type: String, required: true }, 
    timestamp: { type: Date, default: Date.now },  
    attachment: {
        type: String,
        required: false
    } 
});

export const MessageModel = mongoose.model('messages', messageSchema);
