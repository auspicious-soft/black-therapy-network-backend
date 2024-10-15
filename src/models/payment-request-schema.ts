import mongoose, { Schema } from "mongoose"

const paymentRequestSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    statusChangedBy: {
        type: String,
        enum: ['admin', 'QP, OD']
    },
    requestType: {
        type: String,
        required: true
    },
    servicesProvided: {
        type: String,
        required: true
    },
    therapistId: { type: Schema.Types.ObjectId, required: true, ref: 'therapists' },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'clients' },
    serviceDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    progressNotes: { type: String, required: true },
    rejectNote: { type: String , required: false}
},
    { timestamps: true }
);

export const paymentRequestModel = mongoose.model("paymentRequests", paymentRequestSchema);