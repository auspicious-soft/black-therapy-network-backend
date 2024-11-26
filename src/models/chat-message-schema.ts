import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderPath' },
    senderPath: {
        type: String,
        required: true,
        enum: ['clients', 'therapists']
    },
    roomId: { type: String, required: true },
    isCareMsg: { type: Boolean, default: false },
    
    readStatus: { type: Boolean, default: false },
    message: { type: String, required: true },
    attachments: { type: String, required: false }
}, {
    timestamps: true
})

export const MessageModel = mongoose.model('messages', messageSchema);
