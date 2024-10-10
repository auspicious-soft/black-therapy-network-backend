import { Request, Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { addWellnessSchema } from "../../validation/admin-user";
import { formatZodErrors } from "../../validation/format-zod-errors";
import { errorParser } from "../../lib/errors/error-response-handler";
import { addWellnessService, deleteWellnessService, getWellnessService } from "../../services/admin/wellness-service";

export const addWellness = async (req: Request, res: Response) => {
    const validation = addWellnessSchema.safeParse(req.body)
    if (!validation.success) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });
    }
    try {
        const response = await addWellnessService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
    //    if(error.code === 11000) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: 'Cant add duplicate link' })
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteWellness = async (req: Request, res: Response) => {
    try {
        const response = await deleteWellnessService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getWellness = async (req: Request, res: Response) => {
    try{
        const response = await getWellnessService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch(error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}