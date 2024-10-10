import { Request, Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import { getAllPaymentRequestsService, addPaymentRequestService, getPaymentRequestByTherapistIdService, updatePaymentRequestStatusService } from "../../services/payment-request.ts/payment-request-service";
import { z } from "zod";

export const getAllPaymentRequests = async (req: Request, res: Response) => {
    try {
        const response = await getAllPaymentRequestsService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const updatePaymentRequestStatus = async (req: Request, res: Response) => {
    const validation = z.object({
        status: z.string(),
        statusChangedBy: z.string().default("admin"),
    }).safeParse(req.body)
    if (!validation.success) res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "Invalid request body" })
    try {
        const response = await updatePaymentRequestStatusService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const addPaymentRequest = async (req: Request, res: Response) => {
    const validation = z.object({
        requestType: z.string(),
        servicesProvided: z.string(),
        therapistId: z.string(),
        clientId: z.string(),
        serviceDate: z.string(),
        duration: z.number(),
        progressNotes: z.string(),
    }).safeParse(req.body)
    if (!validation.success) res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "Invalid request body" })
    try {
        const response = await addPaymentRequestService(req.body)
        return res.status(httpStatusCode.CREATED).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const getPaymentRequestByTherapistId = async (req: Request, res: Response) => {
    try {
        const response = await getPaymentRequestByTherapistIdService({ id: req.params.id, ...req.query })
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}