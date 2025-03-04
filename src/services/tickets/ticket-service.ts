import { customAlphabet } from "nanoid";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { QueryMessageModel } from "src/models/chat-message-schema";
import { clientModel } from "src/models/client/clients-schema";
import { ticketModel } from "src/models/ticket-schema";
import { queryBuilder } from "src/utils";


// For Client
export const postATicketService = async (payload: any, res: any) => {
    const isTicketExists = await ticketModel.findOne({ roomId: payload.roomId })
    if (isTicketExists) return errorResponseHandler("Ticket already exists", 400, res)
    const client = await clientModel.findById(payload.sender)
    if (!client) return errorResponseHandler("Client not found", 404, res)
    const identifier = customAlphabet('0123456789', 3)()

    const response = await ticketModel.create({ ticketId: identifier, clientName: client.firstName + '' + client.lastName, ...payload })
    await QueryMessageModel.create({
        message: payload.message,
        sender: payload.sender,
        roomId: payload.roomId,
        senderPath: 'clients',
        reciever: 'support'
    })
    return {
        success: true,
        data: response
    }
}

export const getClientTicketsService = async (id: string, res: any) => {
    const response = await ticketModel.find({ sender: id })
    if (!response) return errorResponseHandler("No tickets found", 404, res)
    return {
        success: true,
        data: response
    }
}

// For Admin
export const getTicketsService = async (payload: any, res: any) => {
    const page = parseInt(payload.page) || 1
    const limit = parseInt(payload.limit) || 10
    const offset = (page - 1) * limit

    const { query } = queryBuilder(payload, ['clientName', 'ticketId'])
    const response = (await ticketModel.find(query).skip(offset).limit(limit).populate('sender'))
    const totalCount = Object.keys(query).length ? await ticketModel.countDocuments(query) : await ticketModel.countDocuments()
    if (!response) return errorResponseHandler("No tickets found", 404, res)
    return {
        success: true,
        data: response,
        page,
        limit,
        total: totalCount
    }
}

export const updateTicketStatusService = async (id: string, payload: any, res: any) => {
    const response = await ticketModel.findByIdAndUpdate(id, payload, { new: true })
    if (!response) return errorResponseHandler("Ticket not found", 404, res)
    return {
        success: true,
        data: response
    }
}

export const getATicketByRoomIdService = async (payload: any, res: any) => {
    const response = await ticketModel.findOne({ roomId: payload.roomId }).populate('sender')
    if (!response) return errorResponseHandler("Ticket not found", 404, res)
    return {
        success: true,
        data: response
    }
}