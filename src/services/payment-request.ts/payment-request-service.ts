import { queryBuilder } from "../../utils";
import { paymentRequestModel } from "../../models/payment-request-schema";
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { paymentRequestRejectedEmail } from "../../utils/mails/mail";
import { clientModel } from "src/models/client/clients-schema";
import { customAlphabet } from "nanoid";

export const getAllPaymentRequestsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['identifier'])
    if (payload.status === 'pending') (query as any).status = { $eq: 'pending' }
    if (payload.status === 'rejected') (query as any).status = { $eq: 'rejected' }
    if (payload.status === 'approved') (query as any).status = { $eq: 'approved' }

    const totalDataCount = Object.keys(query).length < 1 ? await paymentRequestModel.countDocuments() : await paymentRequestModel.countDocuments(query)
    const result = await paymentRequestModel.find(query).sort(sort).skip(offset).limit(limit).populate([
        {
            path: 'therapistId',
            select: 'firstName lastName',
        },
        {
            path: 'clientId',
            select: 'firstName lastName',
        },
        {
            path: 'appointmentId',
        }
    ])
   
    
    if (result.length) return {
        success: true,
        page,
        limit,
        total: totalDataCount,
        data: result
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        }
    }
}

export const addPaymentRequestService = async (payload: any, res: Response) => {
    const clientName = await clientModel.findById(payload.clientId)
    if (!clientName) return errorResponseHandler("Client not found", 404, res)
    payload.clientName = `${clientName.firstName} ${clientName.lastName}`
    const identifier = customAlphabet('0123456789', 5)()
    payload.identifier = identifier
    const newPaymentRequest = new paymentRequestModel(payload)
    const result = await newPaymentRequest.save()
    return {
        success: true,
        message: "Payment request added successfully",
        data: result
    }
}

export const getPaymentRequestByTherapistIdService = async (payload: any) => {
    const { id } = payload
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['clientName', 'requestType', 'servicesProvided', 'identifier'])
    const totalDataCount = Object.keys(query).length < 1 ? await paymentRequestModel.countDocuments() : await paymentRequestModel.countDocuments(query)

    const result = await paymentRequestModel.find({ therapistId: id, ...query }).sort(sort).skip(offset).limit(limit).populate([
        {
            path: 'clientId',
            select: 'firstName lastName'
        }
    ])
    if (result.length) return {
        success: true,
        total: totalDataCount,
        page,
        limit,
        data: result,
        message: "Payment request found",
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            message: "No Payment request found",
            total: 0
        }
    }
}

export const updatePaymentRequestStatusService = async (payload: any, res: Response) => {
    const id = payload.id
    const paymentRequest = await paymentRequestModel.findById(id)
    if (!paymentRequest) return errorResponseHandler("Payment request not found", 404, res)
    if (payload.status === 'rejected' && (payload.payoutMethod || payload.payoutAmount || payload.detailsAboutPayment || payload.payoutDate || payload.payoutTime)) return errorResponseHandler("Cannot update payment request with payout details when status is rejected", 400, res)
    if (payload.status === 'approved' && (!payload.payoutMethod || !payload.payoutAmount || !payload.detailsAboutPayment || !payload.payoutDate || !payload.payoutTime)) return errorResponseHandler("All Payout details are required when status is approved", 400, res)

    const updatePayload = { ...payload };
    delete updatePayload.statusChangedBy; // Remove statusChangedBy from payload to avoid conflict

    const result = await paymentRequestModel.findByIdAndUpdate(
        id,
        {
            $push: { statusChangedBy: payload.statusChangedBy }, // Add newStatus to the statusChanged array
            ...updatePayload
        },
        { new: true })
        .populate([
            {
                path: 'therapistId',
                // select: 'firstName lastName',
            },
            {
                path: 'clientId',
                // select: 'firstName lastName',
            }
        ])

    //Avoiding duplicacy of statusChangedBy
    if (result) {
        result.statusChangedBy = Array.from(new Set(result.statusChangedBy))
        await result.save()
    }

    if (payload.status === 'rejected') {
        await paymentRequestRejectedEmail((result as any)?.therapistId.email, result)
        return {
            success: true,
            message: "Payment request status updated successfully and rejected email sent",
            data: result
        }
    }
    return {
        success: true,
        message: "Payment request status updated successfully",
        data: result
    }
}