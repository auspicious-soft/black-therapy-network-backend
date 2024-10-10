import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { MessageModel } from "../models/chat-message-schema";

const router = Router();

router.get('/chat-history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params
        const { page = 1, limit = 50 } = req.query
        const messages = await MessageModel.find({ roomId })
            .sort({ timestamp: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
        res.status(200).json(messages)
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

export { router }