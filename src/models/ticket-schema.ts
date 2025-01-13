import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'clients' },
    clientName: { type: String, required: true },
    roomId: { type: String, required: true , unique: true},
    status: { type: String, required: true, enum: ['Pending', 'Completed'], default: 'Pending'},
    title: { type: String, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true
})

export const ticketModel = mongoose.model('tickets', ticketSchema)