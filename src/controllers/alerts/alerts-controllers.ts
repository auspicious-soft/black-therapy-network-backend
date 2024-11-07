import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import { addAlertService, getAlertsService, updateAlertService } from "../../services/alerts/alerts-service";

export const addAlert = async (req: Request, res: Response) => {
    try {
        const response = await addAlertService(req.body, res)
        return res.status(httpStatusCode.CREATED).json({ success: true, message: "Alert added successfully" })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const getAlerts = async (req: Request, res: Response) => {
    try {
        const response = await getAlertsService(req.query, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Alerts fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const updateAlert = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const response = await updateAlertService({ id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Alert updated successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}