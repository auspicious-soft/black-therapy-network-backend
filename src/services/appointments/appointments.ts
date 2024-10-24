import { Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { appointmentRequestModel } from "../../models/appointment-request-schema"
import { clientModel } from "../../models/client/clients-schema"
import { convertToBoolean, queryBuilder } from "../../utils"
import { therapistModel } from "../../models/therapist/therapist-schema"
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema"


// for admin
export const getAppointmentsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['clientName']);

    if (payload.assignedClients) {
        const value = convertToBoolean(payload.assignedClients);
        if (value) (query as any).therapistId = { $ne: null };
        else (query as any).therapistId = { $eq: null };
    }

    const totalDataCount = Object.keys(query).length < 1 ? await appointmentRequestModel.countDocuments() : await appointmentRequestModel.countDocuments(query);
    const appointmentRequests = await appointmentRequestModel.find(query).sort(sort).skip(offset).limit(limit).populate([{
        path: 'clientId',
    }])

    const populatedAppointments = await Promise.all(appointmentRequests.map(async (appointment: any) => {
        const updatedAppointment = appointment.toJSON()

        if (appointment.therapistId) {
            const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: appointment.therapistId }).select('email profilePic firstName lastName providerType -_id').lean();
            if (onboardingApp) {
                updatedAppointment.therapistId = onboardingApp;
            } else {
                console.log(`Therapist with ID ${appointment.therapistId} not found in onboardingApplications`);
                updatedAppointment.therapistId = { error: "Therapist not found" };
            }
        }

        if (appointment.peerSupportIds && appointment.peerSupportIds.length > 0) {
            updatedAppointment.peerSupportIds = await Promise.all(appointment.peerSupportIds.map(async (peerId: any) => {
                const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: peerId }).select('email profilePic firstName lastName providerType -_id').lean();
                return onboardingApp || { error: "Peer support not found with this object id", id: peerId };
            }));
        }

        return updatedAppointment;
    }));

    if (populatedAppointments.length) {
        return {
            data: populatedAppointments,
            page,
            limit,
            success: true,
            total: totalDataCount
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

// for therapist
export const getAppointmentsByTherapistIdService = async (payload: any, res: Response) => {
    const { id } = payload
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload)
    const queryForTherapistAppointments = {
        $or: [
            { therapistId: { $eq: id } },
            { peerSupportIds: { $in: [id] } }
        ]
    }
    const totalDataCount = Object.keys(query).length < 1 ? await appointmentRequestModel.countDocuments(queryForTherapistAppointments) : await appointmentRequestModel.countDocuments({ ...queryForTherapistAppointments, ...query })
    const result = await appointmentRequestModel.find({ ...queryForTherapistAppointments, ...query }).sort(sort).skip(offset).limit(limit)
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

// for client
export const requestAppointmentService = async (payload: any, res: Response) => {
    const { clientId } = payload
    const client = await clientModel.findById(clientId)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const appointmentRequest = new appointmentRequestModel({ clientId, clientName: client.firstName + " " + client.lastName })
    await appointmentRequest.save()
    return {
        success: true,
        message: "Appointment request created successfully",
        data: appointmentRequest
    }
}

//for admin
export const updateAppointmentStatusService = async (payload: any, res: Response) => {
    const { id, ...restPayload } = payload
    const appointmentRequest = await appointmentRequestModel.findById(id)
    if (!appointmentRequest) return errorResponseHandler("Appointment request not found", httpStatusCode.NOT_FOUND, res)
    const client = await clientModel.findById(appointmentRequest.clientId)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)

    const therapist = await therapistModel.findById(restPayload.therapistId)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)

    const hasClientSubscribedToService = client.serviceSubscribed
    if (!hasClientSubscribedToService) return errorResponseHandler("Client not subscribed to any service", httpStatusCode.BAD_REQUEST, res)

    const updatedAppointmentRequest = await appointmentRequestModel.findByIdAndUpdate(id, { ...restPayload }, { new: true })
    return {
        success: true,
        message: "Appointment request updated successfully",
        data: updatedAppointmentRequest
    }
}


export const getClientAppointmentsService = async (id: string, res: Response) => {
    try {
        const client = await clientModel.findById(id);
        if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res);

        const appointmentRequests = await appointmentRequestModel.find({ clientId: id }).lean();

        const populatedAppointments = await Promise.all(appointmentRequests.map(async (appointment) => {

            if (appointment.therapistId) {
                const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: appointment.therapistId }).select('email profilePic firstName lastName providerType').lean();
                if (onboardingApp as any) {
                    (appointment as any).therapistId = onboardingApp
                } else {
                    console.log(`Therapist with ID ${appointment.therapistId} not found in onboardingApplications`);
                    (appointment as any).therapistId = { error: "Therapist not found" };
                }
            }
            if ((appointment).peerSupportIds && appointment.peerSupportIds.length > 0) {
                (appointment as any).peerSupportIds = await Promise.all(appointment.peerSupportIds.map(async (peerId) => {
                    const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: peerId }).select('email profilePic firstName lastName providerType').lean();
                    return onboardingApp || { error: "Peer support not found", id: peerId };
                }))
            }

            return appointment
        }))

        return {
            success: true,
            message: "Client appointments fetched successfully",
            data: populatedAppointments
        };
    } catch (error) {
        console.error('Error in getClientAppointmentsService:', error);
        return errorResponseHandler("Error fetching appointments", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};