import { isValidObjectId } from "mongoose";
import { MessageModel, QueryMessageModel } from "../models/chat-message-schema";
import { clientModel } from "../models/client/clients-schema";
import { therapistModel } from "../models/therapist/therapist-schema";
import { onboardingApplicationModel } from "src/models/therapist/onboarding-application-schema";
import { appointmentRequestModel } from "src/models/appointment-request-schema";
import { userModel } from "src/models/admin/user-schema";
import { adminModel } from "src/models/admin/admin-schema";
import { ticketModel } from "src/models/ticket-schema";

export default function socketHandler(io: any) {
    io.on('connection', (socket: any) => {
        // console.log('A user connected')
        io.emit('onlineStatus', { userId: socket.data.sender, isOnline: true })

        socket.on('joinRoom', async (payload: any) => {
            const { sender, roomId } = payload
            const validatedRoomId = isValidObjectId(roomId)
            const validatedSender = isValidObjectId(sender)
            const validation = validatedRoomId && validatedSender
            if (!validation || !sender) {
                console.log('Invalid room ID or sender')
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

        socket.on('message', async (payload: any) => {
            const { sender, roomId, message, attachment, isCareMsg = false, fileType, fileName } = payload

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
                        receiverPath: await clientModel.findOne({ _id: receiver }) ? 'clients' : 'therapists',
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

        socket.on('joinQueryRoom', async (payload: any) => {
            const { roomId, sender } = payload
            const validatedSender = isValidObjectId(sender)
            const validation = validatedSender
            if (!validation || !sender) {
                console.log('Invalid room ID or sender')
                return
            }
            socket.data.sender = sender
            socket.join(roomId)

            await QueryMessageModel.updateMany({ roomId, sender: { $ne: sender }, readStatus: false }, { readStatus: true })
            const client = await clientModel.findOne({ _id: sender })
            const users = await userModel.findOne({ _id: sender })
            const admin = await adminModel.findOne({ _id: sender })
            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: true })
            }
            else if (admin) {
                await adminModel.updateOne({ _id: sender }, { isOnline: true })
            }
            else if (users) {
                await userModel.updateOne({ _id: sender }, { isOnline: true })
            }
            else {
                console.log('User not found')
            }
        })

        socket.on('queryMessage', async (payload: any) => {
            const { sender, roomId, message, attachment, fileType, fileName } = payload
            const ticket = await ticketModel.findOne({ roomId })
            if (!ticket) return { success: false, message: 'Query not found' }
            let reciever: string = ''
            const client = await clientModel.findById(sender)
            if (client) {
                reciever = 'support'
            }
            try {
                const newQuery = new QueryMessageModel({
                    sender,
                    senderPath: await clientModel.findOne({ _id: sender }) ? (await userModel.findOne({ _id: sender }) ? 'users' : 'clients') : 'admin',
                    roomId,
                    message: message.trim(),
                    attachment,
                    fileType,
                    fileName,
                    reciever
                })
                await newQuery.save()

                // const receiverSockets = await io.in(roomId).fetchSockets()
                // const isReceiverInRoom = receiverSockets.some((socket: any) => socket.data.sender === (sender === ))

                // if (isReceiverInRoom) {
                //     await QueryMessageModel.updateMany({ roomId, sender: { $ne: sender }, readStatus: false }, { readStatus: true })
                // }
                io.to(roomId).emit('queryMessage',
                    {
                        sender,
                        message,
                        attachment,
                        fileType,
                        createdAt: new Date().toISOString(),
                        reciever,
                    })
            }

            catch (error) {
                console.error('Failed to save message:', error);
            }
        })


        socket.on('disconnect', async () => {
            const sender = socket.data.sender
            if (!sender) {
                // console.log('Sender ID not found in socket data.');
                return;
            }

            const client = await clientModel.findOne({ _id: sender });
            const therapist = await therapistModel.findOne({ _id: sender });
            const admin = await adminModel.findOne({ _id: sender });
            const users = await userModel.findOne({ _id: sender });
            if (client) {
                await clientModel.updateOne({ _id: sender }, { isOnline: false });
            } else if (therapist) {
                await onboardingApplicationModel.updateOne({ therapistId: sender }, { isOnline: false });
            } else if (admin) {
                await adminModel.updateOne({ _id: sender }, { isOnline: false });
            }
            else if (users) {
                await userModel.updateOne({ _id: sender }, { isOnline: false });
            }
            else {
                console.log('User not found');
            }
            socket.broadcast.emit('onlineStatus', { userId: sender, isOnline: false })
        })
    })
}
