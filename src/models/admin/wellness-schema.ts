import mongoose from "mongoose";

const wellnessSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    assignTo: {
        type: String,
        required: true,
    },
    // assignedToId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "clients",
    //     default: '',
    //     required: false
    // },
    link: {
        type: String,
        required: true,
        unique: true
    },
    attachment: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true })


export const wellnessModel = mongoose.model("wellness", wellnessSchema);