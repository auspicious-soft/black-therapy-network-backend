import { Response } from "express"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { userModel } from "src/models/admin/user-schema"
import { tasksModel } from "src/models/tasks-schema"
import { therapistModel } from "src/models/therapist/therapist-schema"
import { queryBuilder } from "src/utils"

//admin
export const postTherapistTasksService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const therapist = await therapistModel.findById(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const newTask = new tasksModel({ therapistId: id, ...rest })
    await newTask.save()
    return {
        success: true,
        message: "Therapist note added successfully",
        data: newTask
    }
}

export const postUserTasksService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const user = await userModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const newTask = new tasksModel({ userId: id, ...rest })
    await newTask.save()
    return {
        success: true,
        message: "User note added successfully",
        data: newTask
    }
}
// admin
export const getTherapistTasksService = async (payload: any, res: Response) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['title', 'priority', 'note'])

    const totalDataCount = Object.keys(query).length < 1 ? await tasksModel.countDocuments() : await tasksModel.countDocuments(query)

    const result = await tasksModel.find(query).sort(sort).skip(offset).limit(limit).populate('therapistId').populate('userId')
    if (result.length) return {
        success: true,
        total: totalDataCount,
        page,
        limit,
        data: result,
        message: "Tasks fetched successfully"
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            message: "No task found",
            total: 0
        }
    }
}

export const getATherapistTasksService = async (payload: any, res: Response) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['title', 'priority', 'note'])

    const totalDataCount = Object.keys(query).length < 1 ? await tasksModel.countDocuments() : await tasksModel.countDocuments(query)

    const result = await tasksModel.find({ therapistId: payload.id, ...query }).sort(sort).skip(offset).limit(limit).populate('therapistId').populate('userId')
    if (result.length) return {
        success: true,
        total: totalDataCount,
        page,
        limit,
        data: result,
        message: "My Tasks fetched successfully"
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            message: "No task found",
            total: 0
        }
    }
}

export const updateTaskStatusService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const task = await tasksModel.findById(id)
    if (!task) return errorResponseHandler("Task not found", httpStatusCode.NOT_FOUND, res)
    const updatedTask = await tasksModel.findByIdAndUpdate(id, { ...rest }, { new: true })
    return {
        success: true,
        message: "Task updated successfully",
        data: updatedTask
    }
}

export const deleteATaskService = async (id: string, res: Response) => {
    const task = await tasksModel.findByIdAndDelete(id)
    if (!task) return errorResponseHandler("Task not found", httpStatusCode.NOT_FOUND, res)

    return {
        success: true,
        message: "Task deleted successfully",
        data: task._id
    }
}