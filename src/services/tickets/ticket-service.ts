import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { ticketModel } from "src/models/ticket-schema";


// For Client
export const postATicketService = async (payload: any, res: any) => {
    const isTicketExists = await ticketModel.findOne({ roomId: payload.roomId })
    if (isTicketExists) return errorResponseHandler( "Ticket already exists", 400, res)  
    const response = await ticketModel.create(payload)
    return {
        success: true,
        data: response
    }
}

export const getClientTicketsService = async (id: string, res: any) => {
    const response = await ticketModel.find({ sender: id })
    if (!response) return errorResponseHandler( "No tickets found", 404, res)  
    return {
        success: true,
        data: response
    }
}

// For Admin
export const getTicketsService = async (payload: any, res: any) => {
    const response = await ticketModel.find(payload)
    if (!response) return errorResponseHandler( "No tickets found", 404, res)  
    return {
        success: true,
        data: response
    }
}