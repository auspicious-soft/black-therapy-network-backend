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

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url); // <-- Define __filename
const __dirname = path.dirname(__filename); // <-- Define __dirname

const PORT = process.env.PORT || 8000;
const app = express();
const http = createServer(app);
app.set("trust proxy", true);

// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        credentials: true,
    })
);

const io = new Server(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

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

app.use("/admin", checkValidAdminRole, admin);
app.use("/therapist", therapist);
app.use("/client", client);
app.use("/chats", chats);
app.post("/login", login)

http.listen(8000, () => console.log(`Server is listening on port ${8000}`));
