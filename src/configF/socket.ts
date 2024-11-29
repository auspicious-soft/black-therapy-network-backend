import { isValidObjectId } from "mongoose";
import { MessageModel } from "../models/chat-message-schema";
import { clientModel } from "../models/client/clients-schema";
import { therapistModel } from "../models/therapist/therapist-schema";
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema";
import { appointmentRequestModel } from "src/models/appointment-request-schema";

export default function socketHandler(io: any) {
    io.on('connection', (socket: any) => {
        // console.log('A user connected')
        io.emit('onlineStatus', { userId: socket.data.sender, isOnline: true });

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
            // Mark all the messages as read with roomId, not my sender id and readStatus as false  
            await MessageModel.updateMany({ roomId, sender: { $ne: sender }, readStatus: false }, { readStatus: true })
            const client = await clientModel.findOne({ _id: sender });
            const therapist = await therapistModel.findOne({ _id: sender });
            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: true });
            } else if (therapist) {
                await onboardingApplicationModel.updateOne({ therapistId: sender }, { isOnline: true });
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
            //Setting the receiver, Create a new message document and save it to db and broadcast it to all clients in the room(appointmentRequest)
            const appointment = await appointmentRequestModel.findById(roomId)
            if (appointment) {
                let receiver
                if (appointment?.therapistId.toString() === sender) {
                    receiver = appointment.clientId?.toString()
                }
                else {
                    receiver = appointment.therapistId?.toString()
                }
                try {
                    const newMessage = new MessageModel({
                        sender,
                        roomId,
                        message: message.trim(),
                        attachment,
                        fileType,
                        fileName,
                        isCareMsg,
                        senderPath: await clientModel.findOne({ _id: sender }) ? 'clients' : 'therapists',
                        receiver
                    })

                    await newMessage.save()

                    // const receiver = 'client1';
                    // const receiverSockets = [
                    //     { data: { sender: 'therapist1' } },
                    //     { data: { sender: 'therapist2' } },
                    //     { data: { sender: 'client1' } }
                    // ];

                    // const isReceiverInRoom = receiverSockets.some((socket: any) => socket.data.sender === receiver);
                    // isReceiverInRoom will be true because there is a socket with sender 'client1'
                    const receiverSockets = await io.in(roomId).fetchSockets()
                    const isReceiverInRoom = receiverSockets.some((socket: any) => socket.data.sender === receiver)
                    if (isReceiverInRoom) {
                        await MessageModel.updateMany({ roomId, receiver, readStatus: false }, { readStatus: true })
                    }
                    // Broadcast the message to all clients in the room
                    io.to(roomId).emit('message', {
                        sender,
                        message,
                        attachment,
                        fileType,
                        isCareMsg,
                        createdAt: new Date().toISOString(),
                        receiver,
                        readStatus: isReceiverInRoom
                    })
                }

                catch (error) {
                    console.error('Failed to save message:', error);
                }
            }
        })

        socket.on('checkOnlineStatus', async (payload: any) => {
            const { userId } = payload;
            const client = await clientModel.findOne({ _id: userId });
            const therapist = await therapistModel.findOne({ _id: userId });

            let isOnline = false;
            if (client) {
                isOnline = client.isOnline;
            } else if (therapist) {
                const onboardingApplication = await onboardingApplicationModel.findOne({ therapistId: userId });
                isOnline = onboardingApplication?.isOnline || false;
            }

            socket.emit('onlineStatus', { userId, isOnline });
        })

        socket.on('disconnect', async () => {
            const sender = socket.data.sender
            if (!sender) {
                console.log('Sender ID not found in socket data.');
                return;
            }
            // console.log(`User ${sender} disconnected`);

            const client = await clientModel.findOne({ _id: sender });
            const therapist = await therapistModel.findOne({ _id: sender });

            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: false });
            } else if (therapist) {
                await onboardingApplicationModel.updateOne({ therapistId: sender }, { isOnline: false });
            } else {
                console.log('User not found');
            }
            socket.broadcast.emit('onlineStatus', { userId: sender, isOnline: false })
        })
    })
}
