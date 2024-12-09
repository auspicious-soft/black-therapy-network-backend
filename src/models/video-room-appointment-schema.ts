// make a mongoose schema for video room appointment
import mongoose, { Schema } from 'mongoose';

const videoRoomAppointmentSchema = new mongoose.Schema({
    appointmentId: { type: Schema.Types.ObjectId, required: true, ref: 'appointmentRequests' },
    roomId: { type: String, required: true },
}, {
    timestamps: true
})

videoRoomAppointmentSchema.index({ appointmentId: 1 }, { unique: true })
export const RoomAppointmentModel = mongoose.model('room-appointments', videoRoomAppointmentSchema)