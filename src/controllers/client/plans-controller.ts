import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorParser } from "../../lib/errors/error-response-handler"
import { afterSubscriptionCreatedService, createSubscriptionService, cancelSubscriptionService } from "src/services/client/plans-service"
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

// WEBHOOK
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

export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const response = await cancelSubscriptionService(req.params.id, req.params.subscriptionId, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}
