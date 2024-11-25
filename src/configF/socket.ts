import { isValidObjectId } from "mongoose";
import { MessageModel } from "../models/chat-message-schema";
import { clientModel } from "../models/client/clients-schema";
import { therapistModel } from "../models/therapist/therapist-schema";

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
                await therapistModel.updateOne({ _id: sender }, { isOnline: true });
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
            const { sender, roomId, message, attachment, isCareMsg = false } = payload

            // Create a new message document and save it
            try {
                const newMessage = new MessageModel({
                    sender,
                    roomId,
                    message: message.trim(),
                    attachment,
                    isCareMsg
                });

                await newMessage.save()

                // Broadcast the message to all clients in the room
                io.to(roomId).emit('message', {
                    sender,
                    message,
                    attachment,
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
                await therapistModel.updateOne({ _id: sender }, { isOnline: false });
                // console.log(`Therapist ${sender} is now offline.`);
            }
            else {
                console.log('User not found');
            }
        })
    })
}


// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const ChatRoom = () => {
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState('');
//   const [roomId, setRoomId] = useState('');
//   const [userId, setUserId] = useState('');

//   useEffect(() => {
// Connect to the socket server
//     const newSocket = io('http://localhost:3000'); // Replace with your server URL
//     setSocket(newSocket);

// Join the chat room when the component mounts
//     newSocket.emit('joinRoom', { sender: userId, roomId });

// Clean up the socket connection when the component unmounts
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [userId, roomId]);

//   useEffect(() => {
//     if (socket) {
// Listen for incoming messages
//       socket.on('message', (data) => {
//         setMessages((prevMessages) => [...prevMessages, data]);
//       });

// Listen for typing events
//       socket.on('typing', ({ userId }) => {
//         console.log(`User ${userId} is typing...`);
//       });

//       socket.on('stopTyping', ({ userId }) => {
//         console.log(`User ${userId} stopped typing.`);
//       });
//     }
//   }, [socket]);

//   const handleSendMessage = () => {
//     if (socket && message.trim() !== '') {
//       socket.emit('message', { sender: userId, roomId, message, attachment: null });
//       setMessage('');
//     }
//   };

//   const handleTyping = () => {
//     if (socket) {
//       socket.emit('typing', { roomId, userId });
//     }
//   };

//   const handleStopTyping = () => {
//     if (socket) {
//       socket.emit('stopTyping', { roomId, userId });
//     }
//   };

//   return (
//     <div>
//       <h2>Chat Room</h2>
//       <div>
//         {messages.map((msg, index) => (
//           <div key={index}>
//             <strong>{msg.sender}:</strong> {msg.message}
//           </div>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter') {
//             handleSendMessage();
//           }
//         }}
//         onKeyPress={handleTyping}
//         onKeyUp={handleStopTyping}
//       />
//       <button onClick={handleSendMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatRoom;