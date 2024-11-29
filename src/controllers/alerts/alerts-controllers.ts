import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import { getAlertsService, updateAlertService, getClinicianAlertsService, markClinicianAlertAsReadService } from "../../services/alerts/alerts-service";

// For admins
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

// For Clinicians
export const getClinicianAlerts = async (req: Request, res: Response) => {
    try {
        const response = await getClinicianAlertsService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const marksClinicianAlertAsRead = async (req: Request, res: Response) => {
    try {
        const response = await markClinicianAlertAsReadService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Alerts fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}