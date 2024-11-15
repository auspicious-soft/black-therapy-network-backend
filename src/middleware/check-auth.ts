import { NextFunction, Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { configDotenv } from "dotenv";
import { decode } from 'next-auth/jwt'
import { JwtPayload } from "jsonwebtoken";
configDotenv()

declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload
        }
    }
}


export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token missing" })
        const decoded = await decode({
            secret: process.env.AUTH_SECRET as string,
            token,
            salt: process.env.JWT_SALT as string
        })
        console.log('process.env.JWT_SALT: ', process.env.JWT_SALT);
        console.log('process.env.AUTH_SECRET: ', process.env.AUTH_SECRET);
        if (!decoded) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token invalid or expired" })
        next()
    } catch (error) {
        return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" })
    }
}