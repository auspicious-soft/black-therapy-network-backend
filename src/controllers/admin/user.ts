import { Request, Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { addUserSchema } from "../../validation/admin-user";
import { formatZodErrors } from "../../validation/format-zod-errors";
import { errorParser } from "../../lib/errors/error-response-handler";
import {addUserService , deleteUserService, getUsersService} from "../../services/admin/user-service";

export const addUser = async (req: Request, res: Response) => {
    const validation = addUserSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });
    try {
        const response = await addUserService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const response = await getUsersService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const response = await deleteUserService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

