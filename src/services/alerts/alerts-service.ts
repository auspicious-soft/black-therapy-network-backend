import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { AlertModel } from "src/models/admin/alerts-schema"
import { queryBuilder } from "src/utils"

export const addAlertService = async (data: any, res: any) => {
    const response = await AlertModel.create(data)
    return {
        success: true,
        data: response
    }
}

export const getAlertsService = async (payload: any, res: any) => {
    const { page = 1, limit = 10 } = payload;
    const offset = (page - 1) * limit;
    let query = {};

    if (payload.read !== undefined) {
        query = { read: payload.read };
    }

    const response = await AlertModel.find(query).skip(offset).limit(limit).populate('userId');
    const totalDataCount = Object.keys(query).length < 1 ? await AlertModel.countDocuments() : await AlertModel.countDocuments(query);

    if (response.length > 0) {
        return {
            success: true,
            data: response,
            page,
            limit,
            total: totalDataCount
        };
    } else {
        return {
            success: true,
            data: [],
            page,
            limit,
            total: 0
        };
    }
};
export const updateAlertService = async (payload: any, res: any) => {
    const alert = await AlertModel.findById(payload.id)
    if (!alert) return errorResponseHandler('Alert not found', httpStatusCode.NOT_FOUND, res)
    const response = await AlertModel.findByIdAndUpdate(payload.id, payload, { new: true })
    return {
        success: true,
        data: response
    }
}