import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { MessageModel, QueryMessageModel } from "../models/chat-message-schema";
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema";
import { RoomAppointmentModel } from "src/models/video-room-appointment-schema";
import { httpStatusCode } from "src/lib/constant";

const router = Router();

router.get('/chat-history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params
        // const { page = 1, limit = 50 } = req.query
        const messages = await MessageModel.find({ roomId }).sort({ createdAt: 1 }).populate('sender')
        // .skip((Number(page) - 1) * Number(limit))
        // .limit(Number(limit))
        if (messages.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No chat history found',
                data: []
            })
            return
        }

        const populatedMessages = await Promise.all(messages.map(async (message) => {
            const therapistDetails = await onboardingApplicationModel.findOne({ therapistId: message.sender._id });
            if (therapistDetails) {
                (message as any).sender = therapistDetails
            }
            return message
        }))

        res.status(200).json({
            success: true,
            message: 'Chat history fetched successfully',
            data: populatedMessages
        })

    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
})

router.get('/queries-history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params
        const messages = await QueryMessageModel.find({ roomId }).sort({ createdAt: 1 }).populate('sender')
        if (messages.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No queries found',
                data: []
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Queries fetched successfully',
            data: messages
        })
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({ error: 'Failed to fetch queries' });
    }

})

router.post('/video-room', async (req, res) => {
    try {
        const { roomId, appointmentId } = req.body
        const data = await RoomAppointmentModel.findOneAndUpdate({ appointmentId: appointmentId.toString() },
            {
                appointmentId,
                roomId,
            },
            { upsert: true, new: true }
        )

        res.status(httpStatusCode.CREATED).json({
            success: true,
            message: 'Video room created successfully',
            data: data
        })
    }
    catch (error) {
        console.error('Error creating video room:', error);
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create video room' });
    }
})

router.route('/video-room/:appointmentId').get(async (req, res) => {
    try {
        const { appointmentId } = req.params
        const data = await RoomAppointmentModel.findOne({ appointmentId })
        if (!data) {
            res.status(httpStatusCode.NO_CONTENT).json({
                success: false,
                message: 'Video room not found',
                data: null
            })
            return
        }
        res.status(httpStatusCode.OK).json({
            success: true,
            message: 'Video room found successfully',
            data: data
        })
    }
    catch (error) {
        console.error('Error fetching video room:', error);
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch video room' });
    }
}).delete(async (req, res) => {
    try {
        const { appointmentId } = req.params
        const data = await RoomAppointmentModel.findOneAndDelete({ appointmentId })
        if (!data) {
            res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: 'Video room not found',
                data: null
            })
            return
        }
        res.status(httpStatusCode.OK).json({
            success: true,
            message: 'Video room deleted successfully',
            data: data
        })
    }
    catch (error) {
        console.error('Error deleting video room:', error);
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete video room' });
    }
})

export { router }