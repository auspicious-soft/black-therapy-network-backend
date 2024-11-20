import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorParser } from "../../lib/errors/error-response-handler"
import { clientSignupSchema, passswordResetSchema } from "../../validation/client-user"
import { formatZodErrors } from "../../validation/format-zod-errors"
import { signupService, forgotPasswordService, getClientWellnessService, newPassswordAfterEmailSentService, passwordResetService, getClientInfoService, editClientInfoService } from "../../services/client/client"
import { z } from "zod"
import { afterSubscriptionCreatedService, createSubscriptionService } from "src/services/client/plans-service"
import mongoose from "mongoose"

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const response = await createSubscriptionService(req.params.id, req.body, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const afterSubscriptionCreated = async (req: Request, res: Response) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const response = await afterSubscriptionCreatedService(req, session, res)
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        await session.abortTransaction()
        const { code, message } = errorParser(error);
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    } finally {
        session.endSession()
    }
}