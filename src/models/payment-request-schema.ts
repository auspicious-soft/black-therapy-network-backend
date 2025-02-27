import mongoose, { Schema } from "mongoose"

const paymentRequestSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    statusChangedBy: {
        type: [String],
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
    clientName: { type: String, required: false },
    serviceDate: { type: Date, required: true },
    serviceTime: { type: String, required: true },
    duration: { type: String, required: true },
    progressNotes: { type: String, required: true },
    rejectNote: { type: String, required: false },

    payoutMethod: { type: String, required: false },
    payoutAmount: { type: Number, required: false },
    detailsAboutPayment: { type: String, required: false },
    payoutDate: { type: Date, required: false },
    payoutTime: { type: String, required: false },
    isLate: { type: Boolean, required: false },
    invoice: { type: String, required: false , default :  null},
    appointmentId: { type: Schema.Types.ObjectId, required: false, ref: 'appointmentRequests' },
},
    { timestamps: true }
)
paymentRequestSchema.index({ therapistId: 1, serviceTime: 1 }, { unique: true });


export const paymentRequestModel = mongoose.model("paymentRequests", paymentRequestSchema);