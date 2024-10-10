import { queryBuilder } from "../../utils";
import { paymentRequestModel } from "../../models/payment-request-schema";
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { paymentRequestRejectedEmail } from "../../utils/mails/mail";

export const getAllPaymentRequestsService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload)

    const totalDataCount = Object.keys(query).length < 1 ? await paymentRequestModel.countDocuments() : await paymentRequestModel.countDocuments(query)
    const result = await paymentRequestModel.find(query).sort(sort).skip(offset).limit(limit).populate([
        {
            path: 'therapistId',
            select: 'firstName lastName',
        },
        {
            path: 'clientId',
            select: 'firstName lastName',
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

export const addPaymentRequestService = async (payload: any) => {
    const newPaymentRequest = new paymentRequestModel(payload)
    const result = await newPaymentRequest.save()
    return {
        success: true,
        message: "Payment request added successfully",
        data: result
    }
}

export const getPaymentRequestByTherapistIdService = async (payload: any) => {
    const id = payload.id
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload)

    const totalDataCount = Object.keys(query).length < 1 ? await paymentRequestModel.countDocuments() : await paymentRequestModel.countDocuments(query)

    const result = await paymentRequestModel.find({ therapistId: id }).sort(sort).skip(offset).limit(limit)
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
    const result = await paymentRequestModel.findByIdAndUpdate(id, payload, { new: true }).populate([
        {
            path: 'therapistId',
            // select: 'firstName lastName',
        },
        {
            path: 'clientId',
            // select: 'firstName lastName',
        }
    ])
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