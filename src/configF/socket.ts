import { isValidObjectId } from "mongoose";
import { MessageModel } from "../models/chat-message-schema";
import { clientModel } from "../models/client/clients-schema";
import { therapistModel } from "../models/therapist/therapist-schema";
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema";

export default function socketHandler(io: any) {
    io.on('connection', (socket: any) => {
        console.log('A user connected')

        // Join a room based on roomId (coming from frontend)
        socket.on('joinRoom', async (payload: any) => {
            const { sender, roomId } = payload
            const validatedRoomId = isValidObjectId(roomId)
            const validatedSender = isValidObjectId(sender)
            const validation = validatedRoomId && validatedSender
            if (!validation) {
                console.log('Invalid room ID')
                return
            }
            socket.data.sender = sender
            socket.join(roomId)
            const client = await clientModel.findOne({ _id: sender});
            const therapist = await therapistModel.findOne({ _id: sender});
            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: true });
                // console.log(`Client ${sender} now online.`);
            } else if (therapist) {
                await onboardingApplicationModel.updateOne({ therapistId: sender }, { isOnline: true });
                // console.log(`Therapist ${sender} is now online.`);
            }
            else {
                console.log('User not found');
            }

        })

        socket.on('typing', ({ roomId, userId }: any) => {
            socket.to(roomId).emit('typing', { userId })
        })

        socket.on('stopTyping', ({ roomId, userId }: any) => {
            socket.to(roomId).emit('stopTyping', { userId })
        })

        // Listen for 'message' event when a new message is sent
        socket.on('message', async (payload: any) => {
            const { sender, roomId, message, attachment, isCareMsg = false, fileType, fileName } = payload

            // Create a new message document and save it
            try {
                const newMessage = new MessageModel({
                    sender,
                    roomId,
                    message: message.trim(),
                    attachment,
                    fileType,
                    fileName,
                    isCareMsg,
                    senderPath: await clientModel.findOne({ _id: sender }) ? 'clients' : 'therapists'
                });

                await newMessage.save()

                // Broadcast the message to all clients in the room
                io.to(roomId).emit('message', {
                    sender,
                    message,
                    attachment,
                    fileType,
                    isCareMsg,
                })
            }
            catch (error) {
                console.error('Failed to save message:', error);
            }
        })

        socket.on('disconnect', async () => {
            const sender = socket.data.sender
            if (!sender) {
                console.log('Sender ID not found in socket data.');
                return;
            }
            console.log(`User ${sender} disconnected`);

            const client = await clientModel.findOne({ _id: sender });
            const therapist = await therapistModel.findOne({ _id: sender });

            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: false });
                // console.log(`Client ${sender} is now offline.`);
            } else if (therapist) {
                await onboardingApplicationModel.updateOne({ therapistId: sender }, { isOnline: false });
                // console.log(`Therapist ${sender} is now offline.`);
            }
            else {
                console.log('User not found');
            }
        })
    })
}
