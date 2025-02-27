import { Response } from "express"
import { httpStatusCode } from "../../lib/constant"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { appointmentRequestModel } from "../../models/appointment-request-schema"
import { clientModel } from "../../models/client/clients-schema"
import { convertToBoolean, getLocalDateTime, queryBuilder } from "../../utils"
import { therapistModel } from "../../models/therapist/therapist-schema"
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema"
import { addAlertService } from "../alerts/alerts-service"
import { noteUnlockedEmail, sendAppointmentEmail } from "src/utils/mails/mail"
import { sendAppointmentTexts } from "src/utils/texts/text"
import { addPaymentRequestService } from "../payment-request.ts/payment-request-service"
import { paymentRequestModel } from "src/models/payment-request-schema"
import { postTherapistTasksService } from "../tasks/tasks-service"


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
    const client = await clientModel.findById(clientId).populate('therapistId')
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    if (!client.phoneNumber || !client.phoneNumber.includes('+1')) return errorResponseHandler("Phone number invalid please update it to book an appointment", httpStatusCode.NO_CONTENT, res)
    const appointmentRequest = new appointmentRequestModel({
        clientId, therapistId: client.therapistId ? client.therapistId : null,
        peerSupportIds: client.peerSupportIds ? client.peerSupportIds : null,
        clientName: client.firstName + " " + client.lastName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
        notificationSent: { onBookingAppointment: true }
    })
    await appointmentRequest.save()
    await clientModel.findByIdAndUpdate(clientId, { $inc: { videoCount: -1 } }, { new: true })

    //Send email and text to client 
    await sendAppointmentEmail("onBookingAppointment", client.email, appointmentRequest)
    await sendAppointmentTexts("onBookingAppointment", client.phoneNumber)

    //Send email and text to therapist
    await sendAppointmentEmail("onBookingAppointment", (client as any).therapistId.email, appointmentRequest, (client as any).therapistId?.firstName)
    await sendAppointmentTexts("onBookingAppointment", (client as any).therapistId.phoneNumber)

    await addAlertService({
        userId: client.therapistId,
        userType: 'therapists',
        message: `Appointment requested by ${appointmentRequest.clientName} please check your latest appointments`,
        date: new Date(),
        type: 'appointment'
    })
    return {
        success: true,
        message: "Appointment request created successfully",
        data: appointmentRequest
    }
}

//for admin
export const updateAssignmentStatusService = async (payload: any, res: Response) => {
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

    if (client.therapistId === null) {
        restPayload.assignedDate = new Date()
        restPayload.assignedTime = new Date().toTimeString().split(' ')[0]
    }
    const updatedClient = await clientModel.findByIdAndUpdate(id, restPayload, { new: true })
    await Promise.all([
        addAlertService({
            userId: therapist._id,
            userType: 'therapists',
            message: 'A new Appointment assigned to you',
            date: new Date(),
            type: 'appointment'
        }),
        addAlertService({
            userId: id,
            userType: 'clients',
            message: 'A new Appointment assigned to you',
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

//for admin
export const assignAppointmentToClientService = async (payload: any, res: Response) => {
    const { clientId, therapistId, peerSupportIds, appointmentDate, appointmentTime } = payload
    const client = await clientModel.findById(clientId)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    if (!client.phoneNumber || !client.phoneNumber.includes('+1')) return errorResponseHandler("Phone number invalid please update it to book an appointment", httpStatusCode.NO_CONTENT, res)
    const appointmentRequest = new appointmentRequestModel({
        clientId,
        therapistId: therapistId ? therapistId : null,
        peerSupportIds: peerSupportIds ? peerSupportIds : null,
        clientName: client.firstName + " " + client.lastName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
        notificationSent: { onBookingAppointment: true }
    })
    await appointmentRequest.save()
    await sendAppointmentEmail("onBookingAppointment", client.email, appointmentRequest)
    await sendAppointmentTexts("onBookingAppointment", client.phoneNumber)


    return {
        success: true,
        message: "Appointment request created successfully",
        data: appointmentRequest
    }
}

export const getAllAppointmentsOfAClientService = async (payload: any, res: Response) => {
    const { id } = payload;
    const page = parseInt(payload.page as string) || 1;
    const limit: any = parseInt(payload.limit as string) || null;
    const offset = (page - 1) * limit;
    let query = {};
    const appointmentType = payload.appointmentType as string;

    const { localNow, localTime } = getLocalDateTime();
    // Convert localNow into a UTC midnight date matching the local date.
    const localDate = new Date(localNow);
    const todayDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));

    if (appointmentType) {
        if (appointmentType === 'past') {
            query = {
                $or: [
                    { appointmentDate: { $lt: todayDate } },
                    {
                        $and: [
                            { appointmentDate: todayDate },
                            { appointmentTime: { $lt: localTime } }
                        ]
                    }
                ]
            };
        }
        else if (appointmentType === 'upcoming') {
            query = {
                $or: [
                    { appointmentDate: { $gt: todayDate } },
                    {
                        $and: [
                            { appointmentDate: todayDate },
                            { appointmentTime: { $gte: localTime } }
                        ]
                    }
                ]
            };
        }
    }

    const client = await clientModel.findById(id);
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)

    const appointmentRequests = await appointmentRequestModel
        .find({ clientId: id, ...query })
        .skip(offset)
        .limit(limit)
        .lean();

    const populatedAppointments = await Promise.all(appointmentRequests.map(async (appointment) => {
        if (appointment.therapistId) {
            const onboardingApp = await onboardingApplicationModel
                .findOne({ therapistId: appointment.therapistId })
                .select('email profilePic firstName lastName providerType therapistId')
                .lean();

            if (onboardingApp as any) {
                (appointment as any).therapistId = onboardingApp;
            } else {
                console.log(`Therapist with ID ${appointment.therapistId} not found in onboardingApplications`);
                (appointment as any).therapistId = { error: "Therapist not found" };
            }
        }

        if (appointment.peerSupportIds && appointment.peerSupportIds.length > 0) {
            (appointment as any).peerSupportIds = await Promise.all(
                appointment.peerSupportIds.map(async (peerId) => {
                    const onboardingApp = await onboardingApplicationModel
                        .findOne({ therapistId: peerId })
                        .select('email profilePic firstName lastName providerType therapistId')
                        .lean();
                    return onboardingApp || { error: "Peer support not found", id: peerId };
                })
            );
        }
        return appointment;
    }));

    const totalCount = appointmentRequests.length;

    if (populatedAppointments.length) {
        return {
            data: populatedAppointments,
            success: true,
            page,
            limit,
            total: totalCount
        };
    }

    return {
        data: [],
        success: false,
        total: 0
    };
};

export const getASingleAppointmentService = async (appointmentId: string, res: Response) => {
    const appointment = await appointmentRequestModel.findById(appointmentId).populate('clientId').populate('therapistId').populate('peerSupportIds').lean()
    if (!appointment) return errorResponseHandler("Appointment not found", httpStatusCode.NOT_FOUND, res);
    return {
        success: true,
        message: "Appointment fetched successfully",
        data: appointment
    }
}

export const getAllAppointmentsForAdminService = async (payload: any) => {
    const page = parseInt(payload.page as string)
    const limit = parseInt(payload.limit as string)
    const offset = (page - 1) * limit
    let { query, sort } = queryBuilder(payload, ['clientName'])

    const totalDataCount = Object.keys(query).length < 1 ? await appointmentRequestModel.countDocuments() : await appointmentRequestModel.countDocuments(query)
    const response = await appointmentRequestModel.find({ ...query }).sort(sort).skip(offset).limit(limit).populate('clientId').populate('therapistId')
    const appointmentIds = response.map((appointment) => appointment._id)
    const attachedPayments = await paymentRequestModel.find({ appointmentId: { $in: appointmentIds } })
    const finalResponse = response.map((appointment) => {
        const payment = attachedPayments.find((payment: any) => payment.appointmentId.toString() === appointment._id.toString())
        return { ...appointment.toObject(), paymentRequest: payment }
    }
    )
    return {
        page,
        limit,
        total: totalDataCount,
        success: true,
        data: finalResponse,
    }

}

export const updateAppointmentStatusService = async (payload: any, res: Response) => {
    const { id, ...restPayload } = payload
    const appointment = await appointmentRequestModel.findById(id)
    if (!appointment) return errorResponseHandler("Appointment not found", httpStatusCode.NOT_FOUND, res)
    const updatedAppointment = await appointmentRequestModel.findByIdAndUpdate(id, { ...restPayload }, { new: true })

    if (payload.status == 'Completed') {
        // Create a payment request automatically
        const alreadyExists = await paymentRequestModel.findOne({ appointmentId: id });

        if (!alreadyExists) {
            await addPaymentRequestService({
                clientId: appointment.clientId,
                therapistId: appointment.therapistId,
                serviceDate: appointment.appointmentDate,
                serviceTime: appointment.appointmentTime,
                requestType: payload.requestType,
                servicesProvided: payload.servicesProvided,
                progressNotes: payload.progressNotes,
                duration: payload.duration,
                invoice: payload.invoice,
                appointmentId: id
            }, res)

            await clientModel.findByIdAndUpdate(appointment.clientId, { $inc: { videoCount: -1 } }, { new: true });
        }
        else {
            //Again lock the appointment request for the therapist
            await appointmentRequestModel.findByIdAndUpdate(id, { isLocked: true }, { new: true })
        }

    }
    await Promise.all([
        addAlertService({
            userId: appointment.therapistId,
            userType: 'therapists',
            message: 'Appointment updated by the team please check your latest appointments',
            date: new Date(),
            type: 'appointment'
        }),
        addAlertService({
            userId: appointment.clientId,
            userType: 'clients',
            message: 'Appointment updated by the team please check your latest appointments',
            date: new Date(),
            type: 'appointment'
        })
    ])

    return {
        success: true,
        message: "Appointment updated successfully",
        data: updatedAppointment
    }
}

export const lockUnlockNoteService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const appointment: any = await appointmentRequestModel.findById(id).populate('therapistId')
    if (!appointment) return errorResponseHandler("Appointment not found", httpStatusCode.NOT_FOUND, res)
    const updatedAppointment = await appointmentRequestModel.findByIdAndUpdate(id, { ...rest }, { new: true })
    if (!rest.isLocked) {
        // Send task to therapist
        await postTherapistTasksService({
            id: appointment.therapistId,
            title: rest.title,
            note: rest.note,
            dueDate: rest.dueDate,
            priority: 'High',
            assignedBy: 'admin'
        }, res)

      const resp = await noteUnlockedEmail(
          (appointment).therapistId.email,
          (appointment).therapistId.firstName,
          appointment.clientName,
          (appointment).appointmentDate.toLocaleDateString(),
          rest.title,
          rest.note,
          rest.dueDate
        )
    }
    return {
        success: true,
        message: "Appointment updated successfully",
        data: updatedAppointment
    }
}