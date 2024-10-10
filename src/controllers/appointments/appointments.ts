import { Request, Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import { getAppointmentsService, requestAppointmentService, updateAppointmentStatusService, getClientAppointmentsService, getAppointmentsByTherapistIdService } from "../../services/appointments/appointments";

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const response = await getAppointmentsService(req.query)
        return res.status(200).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getAppointmentsByTherapistId = async (req: Request, res: Response) => {
    try {
        const response = await getAppointmentsByTherapistIdService({ id: req.params.id, ...req.query }, res)
        return res.status(200).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const requestAppointment = async (req: Request, res: Response) => {
    try {
        const response = await requestAppointmentService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    const payload = { ...req.body, id: req.params.id }
    try {
        const response = await updateAppointmentStatusService(payload, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getClientAppointments = async (req: Request, res: Response) => {
    try {
        const response = await getClientAppointmentsService(req.params.id, res)
        return res.status(200).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}