import mongoose, { Schema } from "mongoose"

const appointmentRequestSchema = new mongoose.Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "clients",
    },
    clientName: {
        type: String,
        required: true
    },  
    therapistId: {
        type: Schema.Types.ObjectId,
        ref: "onboardingApplications",
        default: null
    },
    appointmentDate: {
        type: Date,
        required: false
    },
    appointmentTime: {
        type: String,
        required: false
    },
    peerSupportIds: {
        type: [Schema.Types.ObjectId],
        ref: "onboardingApplications",
        default: null
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Completed", "Not Attended"]
    }
},
    { timestamps: true }
);

export const appointmentRequestModel = mongoose.model("appointmentRequests", appointmentRequestSchema);