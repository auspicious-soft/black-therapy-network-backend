import mongoose from "mongoose"

const serviceAssignmentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
    ccaInEHR: {
        type: String,
    },
    ccaCompletionDate: {
        type: Date,
    },
    ccaCompletedBy: {
        type: String,
    },
    servicesReviewing: {
        type: String,
    },
    assignedTherapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'therapists',
    },
    peerSupportTherapist: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'therapists',
    },
    pcpInEHR: {
        type: String,
    },
    pcpCompletionDate: {
        type: Date,
    },
    pcpCompletedBy: {
        type: String,
    },
    authorizationRequired: {
        type: Boolean,
        default: true
    },
    authorizationCompleted:{
        type: Boolean,
        default: false
    },
    authorizationCompletedBy: {
        type: String,
    },
    authorizationStatus: {
        type: String,
    }
},
    {
        timestamps: true
    }
)

export const serviceAssignmentModel = mongoose.model("serviceAssignments", serviceAssignmentSchema)