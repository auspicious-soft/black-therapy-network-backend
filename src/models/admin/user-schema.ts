import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
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
    role: {
        type: String,
        enum: [
            "Support Team Agent",
            "Support Team Supervisor",
            "Office Admin",
            "Clinical Director",
            "QP / Supervisor",
            "Director of Operation/ Billing",
            "Director",
            "Clinician",
            "Peer Support Specialist",
            "Para Professional",
            "AP"
        ],
        required: true
    }
}, { timestamps: true })

export const userModel = mongoose.model("users", userSchema)