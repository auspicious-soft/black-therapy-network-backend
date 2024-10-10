import { Response } from "express";
import { wellnessModel } from "../../models/admin/wellness-schema";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";


export const addWellnessService = async (payload: any, res: Response) => {
    const { link } = payload
    const wellness = await wellnessModel.findOne({ link })
    if (wellness) return errorResponseHandler("Wellness already exists", httpStatusCode.BAD_REQUEST, res)
    await wellnessModel.create(payload)
    return { success: true, message: "Wellness added successfully" }
}

export const deleteWellnessService = async (id: string, res: Response) => {
    const wellness = await wellnessModel.findByIdAndDelete(id)
    if (!wellness) return errorResponseHandler("Wellness not found", httpStatusCode.NOT_FOUND, res)
    return { success: true, message: "Wellness deleted successfully" }
}

export const getWellnessService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['title', 'assignTo', 'link', 'attachment', 'description'])
    if (payload.assignTo === 'therapist') {
        (query as any).assignTo = { $eq: 'therapist' };
    }
    else {
        (query as any).assignTo = { $eq: 'client' };
    }
    const totalDataCount = Object.keys(query).length < 1 ?  await wellnessModel.countDocuments() : await wellnessModel.countDocuments(query)
    const wellness = await wellnessModel.find(query).sort(sort).skip(offset).limit(limit)
    if (wellness.length) return {
        data: wellness,
        page,
        limit,
        success: true,
        total: totalDataCount
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        }
    }
}