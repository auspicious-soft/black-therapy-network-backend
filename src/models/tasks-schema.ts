import mongoose from "mongoose"

const tasksSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.ObjectId,
        ref: 'therapists',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        requied: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['High', 'Low', 'Medium']
    },
    note: {
        type: String,
        required: true
    },
    attachment: {
        type: String,
    }

})

export const tasksModel = mongoose.model("tasks", tasksSchema)