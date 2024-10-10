import { Response } from "express"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { userModel } from "../../models/admin/user-schema"
import { httpStatusCode } from "../../lib/constant"
import { queryBuilder } from "../../utils"

export const addUserService =async (payload: any, res: Response) => {
    const { email } = payload
    const user = await userModel.findOne({ email })
    if (user) return errorResponseHandler("User already exists", httpStatusCode.BAD_REQUEST, res)
    await userModel.create(payload)
    return { success: true, message: "User added successfully" }
}

export const getUsersService = async(payload:any) =>  {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['name', 'email', 'role'])

    const totalDataCount = Object.keys(query).length < 1 ?  await userModel.countDocuments() : await userModel.countDocuments(query)
    const result = await userModel.find(query).sort(sort).skip(offset).limit(limit)
    if (result.length) return {
        data: result,
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

export const deleteUserService = async (id: string, res: Response) => {
    const user = await userModel.findByIdAndDelete(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    return { success: true, message: "User deleted successfully" }
}   