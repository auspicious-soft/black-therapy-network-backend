import { Request, Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorParser } from "../../lib/errors/error-response-handler"
import { formatZodErrors } from "../../validation/format-zod-errors"
import { userOTPVeificationSchema, therapistSignupSchema, therapistLoginSchema, onboardingApplicationSchema } from "../../validation/therapist-user"
import { loginService, onBoardingService, signupService, getTherapistVideosService, forgotPasswordService, newPassswordAfterEmailSentService, getTherapistDashboardStatsService, getTherapistClientsService} from "../../services/therapist/therapist"
import { z } from "zod"
import mongoose from "mongoose"

export const signup = async (req: Request, res: Response) => {
    try {
        const validation = (!req.body.otp ? therapistSignupSchema : userOTPVeificationSchema).safeParse(req.body)
        if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
        const response = await signupService(req.body, res)
        return res.status(httpStatusCode.CREATED).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const validation = therapistLoginSchema.safeParse(req.body)
        if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
        const response = await loginService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const onBoarding = async (req: Request, res: Response) => {
    try {
        const validation = onboardingApplicationSchema.safeParse(req.body)
        const payload = { ...req.body, profilePic: req.file?.filename }
        if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
        const response = await onBoardingService(payload, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body
    const validation = z.string().email().safeParse(email)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
    try {
        const response = await forgotPasswordService(email, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const newPassswordAfterEmailSent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const response = await newPassswordAfterEmailSentService(req.body, res, session)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        await session.abortTransaction();
        session.endSession();
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getTherapistVideos = async (req: Request, res: Response) => {
    try {
        const response = await getTherapistVideosService()
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


// Dashboard stats
export const getTherapistDashboardStats = async (req: Request, res: Response) => {
    try {
        const response = await getTherapistDashboardStatsService(req.params.id)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

// Clients dedicated and as a peer support
export const getTherapistClients = async (req: Request, res: Response) => {
    try {
        const response = await getTherapistClientsService({id: req.params.id, ...req.query})
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}
