import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import { getAlertsService, updateAlertService, getClinicianAlertsService, deleteAdminAlertService, markClinicianAlertAsReadService, getClientAlertsService, markClientAlertAsReadService, getAdminQueryAlertsService, markAllNotificationsForAdminAsReadService, deleteClientAndClinicianAlertService } from "../../services/alerts/alerts-service";

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


export const deleteAdminAlert = async (req: Request, res: Response) => {
    try {
        const response = await deleteAdminAlertService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Alert deleted successfully" })
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
        await markClinicianAlertAsReadService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications updated successfully" })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

//For Clients
export const getClientAlerts = async (req: Request, res: Response) => {
    try {
        const response = await getClientAlertsService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const marksClientAlertAsRead = async (req: Request, res: Response) => {
    try {
        await markClientAlertAsReadService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications updated successfully" })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const getAdminQueryAlerts = async (req: Request, res: Response) => {
    try {
        const response = await getAdminQueryAlertsService()
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}


export const markAllNotificationsForAdminAsRead = async (req: Request, res: Response) => {
    try {
        const response = await markAllNotificationsForAdminAsReadService()
        return res.status(httpStatusCode.OK).json({ success: true, message: "Notifications updated successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}


// For therapist and clients
export const deleteClientAndClinicianAlert = async (req: Request, res: Response) => {
    try {
        const response = await deleteClientAndClinicianAlertService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Alert deleted successfully" })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}