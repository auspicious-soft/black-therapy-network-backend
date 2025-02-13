import { Request, Response } from "express"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { clientModel } from "../../models/client/clients-schema"
import bcrypt from "bcryptjs"
import { httpStatusCode } from "../../lib/constant"
import { wellnessModel } from "../../models/admin/wellness-schema"
import { isEmailTaken } from "src/utils"

export const signupService = async (payload: any, res: Response) => {
    if (await isEmailTaken(payload.email)) return errorResponseHandler("Email already exists", httpStatusCode.BAD_REQUEST, res)
    const newPassword = bcrypt.hashSync(payload.password, 10)
    payload.password = newPassword
    new clientModel({ ...payload, email: payload.email.toLowerCase().trim() }).save()
    return { success: true, message: "Client signup successfull" }
}


export const passwordResetService = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body
    const getAdmin = await clientModel.findById(req.params.id).select("+password")
    if (!getAdmin) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)

    const passwordMatch = bcrypt.compareSync(currentPassword, getAdmin.password)
    if (!passwordMatch) return errorResponseHandler("Current password invalid", httpStatusCode.BAD_REQUEST, res)
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    const response = await clientModel.findByIdAndUpdate(req.params.id, { password: hashedPassword })
    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const getClientInfoService = async (id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    return {
        success: true,
        message: "Client info fetched successfully",
        data: client
    }
}

export const editClientInfoService = async (payload: any, res: Response) => {
    const { id } = payload
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const { profilePic, ...rest } = payload
    const updatedClient = await clientModel.findByIdAndUpdate(id, payload, { new: true })
    return {
        success: true,
        message: "Client info updated successfully",
        data: updatedClient
    }
}

export const getClientWellnessService = async (payload: any) => {
    const { id } = payload
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const query = {
        assignTo: 'clients',
        assignedToId: { $in: [id, null] }
    }
    const totalDataCount = Object.keys(query).length < 1 ? await wellnessModel.countDocuments(query) : await wellnessModel.countDocuments(query)
    const result = await wellnessModel.find(query).skip(offset).limit(limit)
    if (result.length) return {
        data: result,
        page,
        limit,
        success: true,
        total: totalDataCount
    }
    else return {
        data: [],
        page,
        limit,
        success: false,
        total: 0
    }
}
  