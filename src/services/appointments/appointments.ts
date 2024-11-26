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
    let { query, sort } = queryBuilder(payload, ['clientName']);

    if (payload.assignedClients) {
        const value = convertToBoolean(payload.assignedClients);
        if (value) (query as any).therapistId = { $ne: null };
        else (query as any).therapistId = { $eq: null };
    }

    // const totalDataCount = Object.keys(query).length < 1 ? await appointmentRequestModel.countDocuments() : await appointmentRequestModel.countDocuments(query);
    const allAppointmentRequests = await appointmentRequestModel.find(query).sort(sort).skip(offset).limit(limit).populate([{
        path: 'clientId',
    }])
    const appointmentRequestsWithActiveClients = allAppointmentRequests.filter((appointment: any) => appointment.clientId.status === 'Active Client')
    const totalDataCount = appointmentRequestsWithActiveClients.length;

    const populatedAppointments = await Promise.all(appointmentRequestsWithActiveClients.map(async (appointment: any) => {
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
    }))

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


export const getAllAppointmentsOfAClientService = async (payload: any, res: Response) => {
    const { id } = payload
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    let query = {}
    const appointmentType = payload.appointmentType as string
    if (appointmentType) {
        if (appointmentType === 'past') {
            query = {
                $or: [
                    { status: 'Completed' },
                    { status: 'Not Attended' }
                ]
            }
        }
        else if (appointmentType === 'upcoming') {
            query = { status: 'Pending' }
        }
    }
    try {
        const client = await clientModel.findById(id);
        if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res);

        const appointmentRequests = await appointmentRequestModel.find({ clientId: id, ...query }).skip(offset).limit(limit).lean();

        const populatedAppointments = await Promise.all(appointmentRequests.map(async (appointment) => {

            if (appointment.therapistId) {
                const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: appointment.therapistId }).select('email profilePic firstName lastName providerType therapistId').lean();
                if (onboardingApp as any) {
                    (appointment as any).therapistId = onboardingApp
                } else {
                    console.log(`Therapist with ID ${appointment.therapistId} not found in onboardingApplications`);
                    (appointment as any).therapistId = { error: "Therapist not found" };
                }
            }
            if ((appointment).peerSupportIds && appointment.peerSupportIds.length > 0) {
                (appointment as any).peerSupportIds = await Promise.all(appointment.peerSupportIds.map(async (peerId) => {
                    const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: peerId }).select('email profilePic firstName lastName providerType therapistId').lean();
                    return onboardingApp || { error: "Peer support not found", id: peerId };
                }))
            }

            return appointment
        }))
        const totalCount = appointmentRequests.length;
        if (populatedAppointments.length) {
            return {
                data: populatedAppointments,
                success: true,
                page,
                limit,
                total: totalCount
            }
        } else {
            return {
                data: [],
                success: false,
                total: 0

            }
        }
    }
    catch (error) {
        return errorResponseHandler("Error fetching appointments", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}

export const getASingleAppointmentService = async (appointmentId: string, res: Response) => {
    const appointment = await appointmentRequestModel.findById(appointmentId).populate('clientId')
    if (!appointment) return errorResponseHandler("Appointment not found", httpStatusCode.NOT_FOUND, res)
        const therapistsWithDetails = await onboardingApplicationModel.find({ therapistId: appointment?.therapistId });
    (appointment as any).therapistId = therapistsWithDetails[0]
    const peerSupportDetails = await Promise.all(appointment.peerSupportIds.map(async (peerId: any) => {
        const onboardingApp = await onboardingApplicationModel.findOne({ therapistId: peerId }).lean()
        return onboardingApp || { error: "Peer support not found", id: peerId }
    }));
    (appointment as any).peerSupportDetails = peerSupportDetails

    return {
        success: true,
        message: "Appointment fetched successfully",
        data: appointment
    }
}