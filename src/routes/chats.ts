import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { MessageModel } from "../models/chat-message-schema";
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema";

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
});

export { router }