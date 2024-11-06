import { Response } from "express"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { clientAttachmentModel } from "src/models/admin/client-attachment-schema"
import { clientModel } from "src/models/client/clients-schema"

export const postClientAttachmentsService = async(payload: any, res: Response) => {
    const { id, attachmemts, title } = payload
    console.log('attachments: ', attachmemts);
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const newAttachment = new clientAttachmentModel({ userId: id, attachmemts, title, assignedBy: payload.assignedBy })
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
    const attachments = await clientAttachmentModel.find({ userId: id })
    return {
        success: true,
        message: "Client attachments fetched successfully",
        data: attachments
    }
}