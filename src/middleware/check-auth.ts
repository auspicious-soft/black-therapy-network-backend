import jwt from 'jsonwebtoken'
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

        const isMobileApp = req.headers['x-client-type'] === 'mobile'

        if (isMobileApp) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_PHONE as string)
            if (!decoded) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token invalid or expired" })
            req.user = decoded
        }
        else {
            const decoded = await decode({
                secret: process.env.AUTH_SECRET as string,
                token,
                salt: process.env.JWT_SALT as string
            })
            if (!decoded) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token invalid or expired" })
        }

        next()
    } catch (error) {
        return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" })
    }
}
