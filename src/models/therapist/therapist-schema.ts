import mongoose from "mongoose"

const therapistSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'therapist',
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String
    }, 
    onboardingCompleted: { type: Boolean, default: false },

},
    { timestamps: true }
);

export const therapistModel = mongoose.model("therapists", therapistSchema)