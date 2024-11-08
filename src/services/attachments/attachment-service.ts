import { Response } from "express"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { attachementModel } from "src/models/admin/attachments-schema"
import { clientModel } from "src/models/client/clients-schema"
import { therapistModel } from "src/models/therapist/therapist-schema"

export const postClientAttachmentsService = async(payload: any, res: Response) => {
    const { id, attachmemts, title } = payload
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const newAttachment = new attachementModel({ userId: id, attachmemts, title, assignedBy: payload.assignedBy, userType: 'clients' })
    await newAttachment.save()
    return {
        success: true,
        message: "Client attachment added successfully",
        data: newAttachment
    }
}
export const getClientAttachmentsService = async(id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const attachments = await attachementModel.find({ userId: id })
    return {
        success: true,
        message: "Client attachments fetched successfully",
        data: attachments
    }
}

export const postTherapistAttachmentsService = async(payload: any, res: Response) => {
    const { id, attachmemts, title } = payload
    const therapist = await therapistModel.findById(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const newAttachment = new attachementModel({ userId: id, attachmemts, title, assignedBy: payload.assignedBy, userType: 'therapists' })
    await newAttachment.save()
    return {
        success: true,
        message: "Therapist attachment added successfully",
        data: newAttachment
    }
}

export const getTherapistAttachmentsService = async(id: string, res: Response) => {
    const therapist = await therapistModel.findById(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const attachments = await attachementModel.find({ userId: id })
    return {
        success: true,
        message: "Therapist attachments fetched successfully",
        data: attachments
    }
}