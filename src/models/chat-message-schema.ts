import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderPath' },
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverPath' },
    senderPath: {
        type: String,
        required: true,
        enum: ['clients', 'therapists']
    },
    receiverPath: {
        type: String,
        required: true,
        enum: ['clients', 'therapists']
    },
    roomId: { type: String, required: true },
    isCareMsg: { type: Boolean, default: false },

    readStatus: { type: Boolean, default: false },
    message: { type: String },
    attachment: { type: String, required: false },
    fileType: { type: String, required: false },
    fileName: { type: String, required: false },
}, {
    timestamps: true
})

messageSchema.index({ sender: 1, roomId: 1 })
export const MessageModel = mongoose.model('messages', messageSchema)

const querySchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderPath' },
    reciever: { type: String, required: false },
    senderPath: {
        type: String,
        required: true,
        enum: ['clients', 'admin', 'users']
    },
    roomId: { type: String, required: true },

    readStatus: { type: Boolean, default: false },
    message: { type: String },
    attachment: { type: String, required: false },
    fileType: { type: String, required: false },
    fileName: { type: String, required: false },
}, {
    timestamps: true
});

querySchema.index({ sender: 1, roomId: 1 })
export const QueryMessageModel = mongoose.model('queries', querySchema)