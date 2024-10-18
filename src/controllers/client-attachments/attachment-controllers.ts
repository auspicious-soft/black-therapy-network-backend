import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorParser } from "../../lib/errors/error-response-handler"
import { getClientAttachmentsService, postClientAttachmentsService } from "src/services/client-attachments/attachment-service"


export const postClientAttachments = async (req: Request, res: Response) => {
    try {
        const response = await postClientAttachmentsService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}
export const getClientAttachments = async (req: Request, res: Response) => {
    try {
        const response = await getClientAttachmentsService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}