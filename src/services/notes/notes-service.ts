import { Response } from "express"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { clientModel } from "src/models/client/clients-schema"
import { notesModel } from "src/models/notes-schema"
import { therapistModel } from "src/models/therapist/therapist-schema"

export const postTherapistNotesService = async (payload: any, res: Response) => {
    const { id, note } = payload
    const therapist = await therapistModel.findById(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const newNote = new notesModel({ userId: id, note })
    await newNote.save()
    return {
        success: true,
        message: "Therapist note added successfully",
        data: newNote
    }
}

export const getTherapistNotesService = async (id: string, res: Response) => {
    const therapist = await therapistModel.findById(id)
    if (!therapist) return errorResponseHandler("Therapist not found", httpStatusCode.NOT_FOUND, res)
    const notes = await notesModel.find({ userId: id })
    return {
        success: true,
        message: "Therapist notes fetched successfully",
        data: notes
    }
}

export const postClientNotesService = async (payload: any, res: Response) => {
    const { id, note } = payload
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res) 
    const newNote = new notesModel({ userId: id, note })
    await newNote.save()
    return {
        success: true,
        message: "Client note added successfully",
        data: newNote
    }   
    }

export const getClientNotesService = async (id: string, res: Response) => {
    const client = await clientModel.findById(id)
    if (!client) return errorResponseHandler("Client not found", httpStatusCode.NOT_FOUND, res)
    const notes = await notesModel.find({ userId: id })
    return {
        success: true,
        message: "Client notes fetched successfully",
        data: notes
    }
}