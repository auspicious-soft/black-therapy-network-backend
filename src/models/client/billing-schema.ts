import mongoose from "mongoose"

const billingSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
    insuranceVerified: {
        type: Boolean,
        default: false
    },
    scaleDisount: {
        type: Number,
        default: 0
    },
    billingStatus: {
        type: String,
    },
    scaleTermsOrNotes: {
        type: String
    },
    lastInsuranceCheck: {
        type: String
    },
    simplePractice: {
        type: Boolean,
        default: true
    }


},
    {
        timestamps: true
    }
)

export const billingModel = mongoose.model("billings", billingSchema)