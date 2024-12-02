import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'clients' },
    roomId: { type: String, required: true , unique: true},
}, {
    timestamps: true
})

export const ticketModel = mongoose.model('tickets', ticketSchema)