import express from "express";
import cors from "cors";
// import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url'; // <-- Add this import
import connectDB from "./configF/db";
import { admin, chats, client, therapist } from "./routes";
import { checkValidAdminRole } from "./utils";
import { createServer } from 'http';
import { Server } from "socket.io";
import socketHandler from "./configF/socket";
import { login } from "./controllers/therapist/therapist";
import bodyParser from 'body-parser'
import { allowedOrigins } from "./lib/constant";
import cron from 'node-cron';
import { sendAppointmentNotifications } from "./configF/cron";
const __filename = fileURLToPath(import.meta.url); // <-- Define __filename
const __dirname = path.dirname(__filename); // <-- Define __dirname


const app = express();
const http = createServer(app);
app.set("trust proxy", true);

app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
    }
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: [
            'https://blacktherapy-full-frontend.vercel.app',
            'https://api.blacktherapy.net'  // Add your API domain
            , 'http://localhost:3000'
        ],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        credentials: true,
    })
)

const io = new Server(http, {
    // path: '/socket.io/',  Dont required as we are using default path
    cors: {
        origin: [
            'https://blacktherapy-full-frontend.vercel.app',
            'https://api.blacktherapy.net'  // Add your API domain
            , 'http://localhost:3000'
        ],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
        credentials: true,
    },
});


// Attach io to req
app.use((req: any, res: any, next: any) => {
    req.io = io;
    next();
});

var dir = path.join(__dirname, 'static');
app.use(express.static(dir));

var uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Connection to database
connectDB();


// IO Connection
socketHandler(io);

app.get("/", (req: any, res: any) => {
    res.send("Hello world entry point 🚀");
});

app.use("/api/admin", checkValidAdminRole, admin);
app.use("/api/therapist", therapist);
app.use("/api/client", client);
app.use("/api/chats", chats);
app.post("/api/login", login)


// Scheduler for sending notifications
// cron.schedule('*/15 * * * *', () => {
// sendAppointmentNotifications();
// })
// 
http.listen(8000, () => console.log(`Server is listening on port ${8000}`));
