import { Response } from "express";
import { therapistModel } from "../../models/therapist/therapist-schema";
import bcrypt from "bcryptjs";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { onboardingApplicationModel } from "../../models/therapist/onboarding-application-schema";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../utils/mails/token";
import { sendPasswordResetEmail } from "../../utils/mails/mail";
import { passwordResetTokenModel } from "../../models/password-token-schema";
import mongoose from "mongoose";
import { wellnessModel } from "../../models/admin/wellness-schema";
import { appointmentRequestModel } from "../../models/appointment-request-schema";
import { isEmailTaken, queryBuilder } from "../../utils";
import { clientModel } from "../../models/client/clients-schema";
import { adminModel } from "src/models/admin/admin-schema";
import { userModel } from "src/models/admin/user-schema";
import { tasksModel } from "src/models/tasks-schema";
import jwt from 'jsonwebtoken'

export const signupService = async (payload: any, res: Response) => {
    const { email } = payload
    if (await isEmailTaken(email)) return errorResponseHandler('User already exists', httpStatusCode.FORBIDDEN, res)
    const newPassword = bcrypt.hashSync(payload.password, 10)
    payload.password = newPassword
    const newUser = new therapistModel({ ...payload, email: email.toLowerCase().trim() })
    await newUser.save()
    return { success: true, message: "User created successfully" }
}

export const loginService = async (payload: any, res: Response) => {
    const { email, password } = payload
    const models = [therapistModel, adminModel, clientModel, userModel]
    let user: any = null
    let userType: string = ''

    for (const model of models) {
        user = await (model as any).findOne({ email: email.toLowerCase() }).select('+password')
        if (user) {
            userType = model.modelName
            break
        }
    }
    if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res)

    let isPasswordValid = false
    const manualUser = await userModel.findOne({ email: email.toLowerCase() }).select('+password')
    if (manualUser) {
        isPasswordValid = password === manualUser.password
    } else {
        isPasswordValid = bcrypt.compareSync(password, user.password)
    }
    if (!isPasswordValid) return errorResponseHandler('Invalid password', httpStatusCode.UNAUTHORIZED, res)

    const userObject: any = user.toObject()
    delete userObject.password

    if (userType === 'therapists') {
        const onboardingApplication = await onboardingApplicationModel.findOne({ therapistId: user._id })
        userObject.onboardingApplication = onboardingApplication;
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET_PHONE as string)

    return {
        success: true,
        message: "Login successful",
        data: { user: userObject, token }
    }
}

export const onBoardingService = async (payload: any, res: Response) => {
    const { email } = payload
    const user = await therapistModel.findOne({ email })
    if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res)
    if (user.onboardingCompleted) return errorResponseHandler('User already onboarded go to login', httpStatusCode.BAD_REQUEST, res)
    const onboardingApplication = new onboardingApplicationModel({ therapistId: user._id, ...payload })
    await onboardingApplication.save()
    await therapistModel.findByIdAndUpdate(user._id, { onboardingCompleted: true })
    return { success: true, message: "Onboarding completed successfully" }
}

export const forgotPasswordService = async (email: string, res: Response) => {
    const client = await therapistModel.findOne({ email })
    if (!client) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res)
    const passwordResetToken = await generatePasswordResetToken(email)
    if (passwordResetToken !== null) {
        await sendPasswordResetEmail(email, passwordResetToken.token)
        return { success: true, message: "Password reset email sent" }
    }
}

export const newPassswordAfterEmailSentService = async (payload: { password: string, token: string }, res: Response, session: mongoose.mongo.ClientSession) => {
    const { password, token } = payload
    const existingToken = await getPasswordResetTokenByToken(token)
    if (!existingToken) return errorResponseHandler("Invalid token", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("Token expired", httpStatusCode.BAD_REQUEST, res)

    const existingClient = await therapistModel.findOne({ email: existingToken.email }).session(session)
    if (!existingClient) return errorResponseHandler("Therapist email not found", httpStatusCode.NOT_FOUND, res)

    const hashedPassword = await bcrypt.hash(password, 10)
    const response = await therapistModel.findByIdAndUpdate(existingClient._id, { password: hashedPassword }, { session, new: true })
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id).session(session)
    await session.commitTransaction()
    session.endSession()

    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const getTherapistVideosService = async (payload: any) => {
    const { id } = payload
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const query = {
        assignTo: 'therapists',
        assignedToId: { $in: [id, null] }
    }
    const totalDataCount = Object.keys(query).length < 1 ? await wellnessModel.countDocuments(query) : await wellnessModel.countDocuments(query)
    const result = await wellnessModel.find(query).skip(offset).limit(limit)
    if (result.length) return {
        data: result,
        page,
        limit,
        success: true,
        total: totalDataCount
    }
    else return {
        data: [],
        page,
        limit,
        success: false,
        total: 0
    }
}

//Dashboard stats service
export const getTherapistDashboardStatsService = async (id: string) => {
    const therapistAppointments = await appointmentRequestModel.find({
        $or: [
            { therapistId: { $eq: id } },
            { peerSupportIds: { $in: [id] } }
        ]
    })
    const totalClients = therapistAppointments.length

    const myTasks = await tasksModel.countDocuments({ therapistId: id, status: 'Pending' })

    const pendingVideoChat = therapistAppointments.filter((x: any) => x.video === true && x.status === 'Pending').length
    return {
        success: true,
        message: "Dashboard stats fetched successfully",
        data: {
            totalClients,
            myOpenTasks: myTasks,
            pendingVideoChat
        }
    }
}

// Therapist clients
export const getTherapistClientsService = async (payload: any) => {
    const { id, ...rest } = payload;
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit
    let query: any = {};
    // Combine both 'dedicated' and 'peer' clients in the query 
    (query as any).$or = [
        { therapistId: { $eq: id } },
        { peerSupportIds: { $in: [id] } },
    ]
    if (payload.description) {
        query.clientName = { $regex: payload.description, $options: 'i' };
    }

    const totalDataCount = Object.keys(query).length < 1 ? await appointmentRequestModel.countDocuments() : await appointmentRequestModel.countDocuments(query);
    const result = await appointmentRequestModel.find(query).skip(offset).limit(limit).populate([
        {
            path: 'clientId',
            select: 'email phoneNumber firstName lastName assignedDate assignedTime message video',
        }
    ])

    if (result.length) {
        return {
            success: true,
            page,
            limit,
            total: totalDataCount,
            data: result
        };
    } else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        };
    }
}

export const getTherapistService = async (id: string, res: Response) => {
    const therapist = await onboardingApplicationModel.findOne({ therapistId: id })
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    return {
        success: true,
        message: "Therapist fetched successfully",
        data: therapist
    }
}

export const updateTherapistService = async (id: string, payload: any, res: Response) => {
    const therapist = await onboardingApplicationModel.findOne({ therapistId: id })
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const updatedTherapist = await onboardingApplicationModel.findByIdAndUpdate(therapist._id, payload, { new: true })
    //Also update the therapist in the database
    if (payload.lastName || payload.firstName || payload.phoneNumber) {
        await therapistModel.findByIdAndUpdate(id, payload, { new: true })
    }
    return {
        success: true,
        message: "Therapist updated successfully",
        data: updatedTherapist
    }
}