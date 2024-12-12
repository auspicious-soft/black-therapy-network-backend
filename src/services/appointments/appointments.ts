import { Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { appointmentRequestModel } from "../../models/appointment-request-schema"
import { clientModel } from "../../models/client/clients-schema"
import { convertToBoolean, queryBuilder } from "../../utils"
import { therapistModel } from "../../models/therapist/therapist-schema"
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema"
import { addAlertService } from "../alerts/alerts-service"

// for admin
export const getAppointmentsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit;
    let { query, sort } = queryBuilder(payload, ['firstName', 'lastName']);

    if (payload.assignedClients) {
        const value = convertToBoolean(payload.assignedClients);
        if (value) (query as any).therapistId = { $ne: null };
        else (query as any).therapistId = { $eq: null };
    }

    const totalDataCount = Object.keys(query).length < 1 ? await clientModel.countDocuments() : await clientModel.countDocuments(query)
    const response = await clientModel.find({ status: 'Active Client', ...query }).sort(sort).skip(offset).limit(limit).populate('therapistId').populate('peerSupportIds').lean()
    // const populataTedClients = await Promise.all(response.map(async (client) => {
    //     const clientObj: any = client.toObject()


    //     if (clientObj.therapistId !== null) {
    //         const therapistDetails = await onboardingApplicationModel.findOne({ therapistId: client.therapistId });
    //         clientObj.therapistId = therapistDetails ? therapistDetails.toObject() : null;
    //     }

    //     if (clientObj?.peerSupportIds?.length > 0) {
    //         const peerSupportDetails = await onboardingApplicationModel.find({ therapistId: { $in: client.peerSupportIds } });
    //         clientObj.peerSupportIds = peerSupportDetails.map((peerSupport) => peerSupport.toObject());
    //     }

    //     return clientObj;
    // }))

    return {
        page,
        limit,
        total: totalDataCount,
        success: true,
        data: response,
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
    const { clientId, appointmentDate, appointmentTime } = payload
    const client = await clientModel.findById(clientId)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)

    const appointmentRequest = new appointmentRequestModel({
        clientId, therapistId: client.therapistId ? client.therapistId : null,
        peerSupportIds: client.peerSupportIds ? client.peerSupportIds : null,
        clientName: client.firstName + " " + client.lastName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime
    })
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
    const { message, video } = restPayload
    const booleanMsg = convertToBoolean(message)
    const booleanVideo = convertToBoolean(video)
    restPayload.message = booleanMsg
    restPayload.video = booleanVideo
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)

    const therapist = await therapistModel.findById(restPayload.therapistId)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)

    const hasClientSubscribedToService = client.serviceSubscribed
    if (!hasClientSubscribedToService) return errorResponseHandler("Client not subscribed to any service", httpStatusCode.BAD_REQUEST, res)

        if(client.therapistId === null) {
            restPayload.assignedDate = new Date()
            restPayload.assignedTime = new Date().toTimeString().split(' ')[0]
        }
   const updatedClient =  await clientModel.findByIdAndUpdate(id, restPayload, { new: true })
    // const onboardingTherapist_id = await onboardingApplicationModel.findOne({ therapistId: restPayload.therapistId }).select('_id')
    // const onboardingPeerSupport_ids = await onboardingApplicationModel.find({ therapistId: { $in: restPayload.peerSupportIds } }).select('_id')
    // const { therapistId, peerSupportIds, ...rest } = restPayload
    // rest.therapistId = onboardingTherapist_id
    // rest.peerSupportIds = onboardingPeerSupport_ids
    // const updatedAppointmentRequest = await appointmentRequestModel.findByIdAndUpdate(id, { ...rest }, { new: true })

    // Sending notification to therapist and client
    await Promise.all([
        addAlertService({
            userId: therapist._id,
            userType: 'therapists',
            message: 'Appointment assigned to you',
            date: new Date(),
            type: 'appointment'
        }),
        addAlertService({
            userId: id,
            userType: 'clients',
            message: 'Appointment has been assigned to you',
            date: new Date(),
            type: 'appointment'
        })
    ])

    return {
        success: true,
        message: "Appointment request updated successfully",
        data: updatedClient
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