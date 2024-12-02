import { httpStatusCode } from "src/lib/constant"
import { errorParser } from "src/lib/errors/error-response-handler"
import { postATicketService, getClientTicketsService, getTicketsService } from "src/services/tickets/ticket-service"

// For Client
export const postATicket = async (req: any, res: any) => {
    try {
        const response = await postATicketService({ sender: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json({ success: true, message: "Ticket Added Successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const getClientTickets = async (req: any, res: any) => {
    try {
        const response = await getClientTicketsService(req.params.id, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Ticket fetched successfully of the client", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}


//For Admin
export const getTickets = async (req: any, res: any) => {
    try {
        const response = await getTicketsService(req.query, res)
        return res.status(httpStatusCode.OK).json({ success: true, message: "Ticket fetched successfully", data: response })
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}