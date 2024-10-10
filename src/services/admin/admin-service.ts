import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { therapistModel } from "../../models/therapist/therapist-schema";
import { onboardingApplicationModel } from "../../models/therapist/onboarding-application-schema";
import { queryBuilder } from "../../utils";
import { clientModel } from "../../models/client/clients-schema";
import { appointmentRequestModel } from "../../models/appointment-request-schema";
import { billingModel } from "../../models/client/billing-schema";
import { serviceAssignmentModel } from "../../models/client/service-assignment-schema";
// import { passswordResetSchema, testMongoIdSchema } from "../../validation/admin-user";
// import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../lib/send-mail/tokens";
// import { sendPasswordResetEmail } from "../../lib/send-mail/mail";
// import { passwordResetTokenModel } from "../../models/password-forgot-schema";



interface loginInterface {
    email: string;
    password: string;
}

//Auth Services
export const loginService = async (payload: loginInterface, res: Response) => {
    const getAdmin = await adminModel.findOne({ email: payload.email.toLowerCase() }).select("+password")
    if (!getAdmin) return errorResponseHandler("Admin not found", httpStatusCode.NOT_FOUND, res)
    const passwordMatch = bcrypt.compareSync(payload.password, getAdmin.password)
    if (!passwordMatch) return errorResponseHandler("Invalid password", httpStatusCode.BAD_REQUEST, res)
    const tokenPayload = {
        id: getAdmin._id,
        email: getAdmin.email,
        role: getAdmin.role
    }
    // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: "30d" })
    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //     domain: "24-x7-fx-admin-frontend.vercel.app",
    //     maxAge: 30  24  60  60  1000
    // })
    return { success: true, message: "Admin Login successfull", data: tokenPayload }
}



// Dashboard
export const getDashboardStatsService = async (payload: any, res: Response) => {
    const { id } = payload.query
    const getAdmin = await adminModel.findById(id)
    if (!getAdmin) return errorResponseHandler("Admin not found", httpStatusCode.NOT_FOUND, res)
    const result = {
        activeClinicians: 0,
        newClinicians: 0,
        cliniciansApproved: 0,
        totalPaymentRequests: 0,
        pendingPaymentRequests: 0,
        pendingClinicalReviews: 0
    };

    const therapists = await therapistModel.find();
    result.activeClinicians = therapists.filter(t => t.status === 'Active').length;
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    result.newClinicians = therapists.filter(t => t.createdAt > tenDaysAgo).length;


    const onboardingApplications = await onboardingApplicationModel.find();
    result.cliniciansApproved = onboardingApplications.filter(a => a.backgroundCheckCompleted).length;

    //TODO: Fetch payment requests and pending clinical reviews
    result.totalPaymentRequests = 3695;
    result.pendingPaymentRequests = 164;
    result.pendingClinicalReviews = 2;

    return { success: true, message: "Dashboard stats fetched successfully", data: result }

}

// Client Services
export const getClientsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['firstName', 'lastName'])
    const totalDataCount = Object.keys(query).length < 1 ? await clientModel.countDocuments() : await clientModel.countDocuments(query)
    const clients = await clientModel.find(query).sort(sort).skip(offset).limit(limit)
    if (clients.length) {
        // Fetch clients
        const clientAppointments = await appointmentRequestModel.find({
            clientId: { $in: clients.map(c => c._id) }
        }).sort({ appointmentDate: -1 });

        // Create a map of client IDs to their appointments
        const appointmentMap = clientAppointments.reduce((map: any, appointment: any) => {
            if (!map[appointment.clientId.toString()]) {
                map[appointment.clientId.toString()] = [];
            }
            const appointmentObj = appointment.toObject();
            delete appointmentObj.clientId;
            delete appointmentObj.clientName;
            delete appointmentObj.__v
            map[appointment.clientId.toString()].push(appointmentObj);
            return map
        }, {})

        // Add appointments to each client
        const clientsWithAppointments = clients.map(client => {
            const clientObject = client.toObject() as any
            clientObject.appointments = appointmentMap[client._id.toString()] || [];
            return clientObject;
        });

        return {
            success: true,
            data: clientsWithAppointments,
            page,
            limit,
            total: totalDataCount
        };
    } else {
        return {
            success: false,
            data: [],
            page,
            limit,
            total: 0
        };
    }
}

export const getAClientService = async (id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    return { success: true, data: client }
}

export const deleteClientService = async (id: string, res: Response) => {
    const client = await clientModel.findByIdAndDelete(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    return { success: true, message: "Client deleted successfully" }
}

export const updateClientService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const updatedClient = await clientModel.findByIdAndUpdate(id, rest, { new: true })
    return { success: true, message: "Client status updated successfully", data: updatedClient }
}

export const addClientBillingService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const newPayload = { ...rest, clientId: id }
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const newBilling = new billingModel(newPayload)
    await newBilling.save()
    return { success: true, message: "Client billing added successfully", data: newBilling }
}

export const getClientBillingService = async (id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const clientBillings = await billingModel.find({ clientId: id })
    return { success: true, data: clientBillings, message: "Client billings fetched successfully" }
}

export const addClientServiceAssignmentService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const newPayload = { ...rest, clientId: id }
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const newServiceAssignment = new serviceAssignmentModel(newPayload)
    await newServiceAssignment.save()
    return { success: true, message: "Client service assignment added successfully", data: newServiceAssignment }
}

export const getClientServiceAssignmentService = async (id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const clientServiceAssignments = await serviceAssignmentModel.find({ clientId: id })
    return { success: true, message: "Client service assignments fetched successfully", data: clientServiceAssignments }
}
//make same 2 apis like above and it will be for service assignments

//Therapist Services
export const getTherapistsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['firstName', 'lastName']);

    const totalDataCount = Object.keys(query).length < 1 ? await therapistModel.countDocuments() : await therapistModel.countDocuments(query)
    const therapists = await therapistModel.find(query).sort(sort).skip(offset).limit(limit);

    if (therapists.length) {
        const therapistIds = therapists.map(t => t._id);

        const appointments = await appointmentRequestModel.find({
            $or: [
                { therapistId: { $eq: therapistIds } },
                { peerSupportIds: { $in: therapistIds } }
            ]
        }).sort({ appointmentDate: -1 });

        const appointmentMap = appointments.reduce((map: any, appointment: any) => {
            const therapistId = appointment.therapistId.toString()
            const addAppointmentToMap = (id: any) => {
                if (!map[id]) {
                    map[id] = []
                }
                map[id].push(appointment)
            };

            addAppointmentToMap(therapistId)
            appointment.peerSupportIds.forEach((id: any) => addAppointmentToMap(id.toString()))
            return map
        }, {});

        const therapistsWithAppointments = therapists.map(therapist => {
            const therapistObject = therapist.toObject() as any;
            const therapistIdStr = therapist._id.toString();
            therapistObject.appointments = appointmentMap[therapistIdStr] || [];
            return therapistObject;
        });

        return {
            page,
            limit,
            success: true,
            total: totalDataCount,
            data: therapistsWithAppointments
        }
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        };
    }
}

export const updateTherapistService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const therapist = await onboardingApplicationModel.find({ therapistId: id })
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const updatedTherapist = await onboardingApplicationModel.findOneAndUpdate({ therapistId: id }, rest, { new: true })
    return { success: true, message: "Therapist updated successfully", data: updatedTherapist }
}

export const deleteTherapistService = async (id: string, res: Response) => {
    const therapist = await therapistModel.findByIdAndDelete(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    return { success: true, message: "Therapist deleted successfully" }
}

