import { AlertModel } from "src/models/admin/alerts-schema"
import { queryBuilder } from "src/utils"

export const addAlertService = async (data: any, res: any) => {
    const response = await AlertModel.create(data)
    return response
}

export const getAlertsService = async (payload: any, res: any) => {
    const { page = 1, limit = 10 } = payload
    const offset = (page - 1) * limit
    const { query } = queryBuilder(payload)
    const response = await AlertModel.find(query).skip(offset).limit(limit) 
    const totalDataCount = Object.keys(query).length < 1 ? await AlertModel.countDocuments() : await AlertModel.countDocuments(query)
    if(response.length > 0) {
        return {
            success: true,
            data: response,
            page,
            limit,
            total: totalDataCount
        }
    }
    else {
        return {
            success: true,
            data: [],
            page,
            limit,
            total: 0
        }
    }
}
