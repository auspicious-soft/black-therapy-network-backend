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
    billingStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    scaleTermsOrNotes: {
        type: String
    },
    lastInsuranceCheck: {

    },
    simplePractice: {
        type: Boolean,
        default: true
    },
    

},
    {
        timestamps: true
    }
)

export const billingModel = mongoose.model("billings", billingSchema)