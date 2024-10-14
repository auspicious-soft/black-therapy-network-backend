import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorParser } from "../../lib/errors/error-response-handler"
import { getTherapistNotesService, postTherapistNotesService } from "src/services/notes/notes-service"

export const postTherapistNotes = async (req: Request, res: Response) => {
    try {
        const response = await postTherapistNotesService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const getTherapistNotes = async (req: Request, res: Response) => {
    try {
        const response = await getTherapistNotesService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })

    }
}