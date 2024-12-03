import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'clients' },
    roomId: { type: String, required: true , unique: true},
    status: { type: String, required: true, enum: ['Pending', 'Completed'], default: 'Pending'},
    title: { type: String, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true
})

export const ticketModel = mongoose.model('tickets', ticketSchema)