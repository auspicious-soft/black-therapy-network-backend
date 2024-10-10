import { Request, Response } from "express"
import { adminUserLoginSchema } from "../../validation/admin-user";
import { formatZodErrors } from "../../validation/format-zod-errors";
import {
    loginService,
    //  editInfoService, 
    //  getInfoService,
    //   newPassswordAfterEmailSentService, 
    //   passwordResetService,
    //    forgotPasswordService,
    getDashboardStatsService,
    getClientsService,
    getTherapistsService,
    deleteTherapistService,
    deleteClientService,
    updateClientService,
    getAClientService,
    updateTherapistService,
    addClientBillingService,
    getClientBillingService,
    addClientServiceAssignmentService,
    getClientServiceAssignmentService
    // updateDashboardStatsService 
} from "../../services/admin/admin-service";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { onboardingApplicationSchema, updateTherapistSchema } from "../../validation/therapist-user";


//Auth Controllers
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "Email and password is required" });
        }
        const validation = adminUserLoginSchema.safeParse(req.body)
        if (!validation.success) {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });
        }
        const response = await loginService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

// export const verifySession = async (req: Request, res: Response) => {
//     try {
//         const token = req.cookies["token"];
//         if (!token) {
//             return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
//         }

//         jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
//             if (err) {
//                 return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
//             }
//             res.status(httpStatusCode.OK).json({ success: true, data: decoded });
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong" });
//     }
// }

// export const passwordReset = async (req: Request, res: Response) => {
//     const validation = passswordResetSchema.safeParse(req.body)
//     const idValidation = testMongoIdSchema.safeParse((req.user as JwtPayload)?.id)
//     if (!idValidation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(idValidation.error) })
//     if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const response = await passwordResetService(req, res, session)
//         return res.status(httpStatusCode.OK).json(response)
//     } catch (error: any) {
//         const { code, message } = errorParser(error)
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
//     }
// }

// export const forgotPassword = async (req: Request, res: Response) => {
//     const { email } = req.body
//     const validation = z.string().email().safeParse(email)

//     if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const response = await forgotPasswordService(email, res, session)
//         return res.status(httpStatusCode.OK).json(response)
//     }
//     catch (error: any) {
//         const { code, message } = errorParser(error)
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
//     }
// }

// export const newPassswordAfterEmailSent = async (req: Request, res: Response) => {
//     const { password } = req.body
//     const validation = passwordSchema.safeParse(password)
//     if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const response = await newPassswordAfterEmailSentService(req.body, res, session)
//         return res.status(httpStatusCode.OK).json(response)
//     }
//     catch (error: any) {
//         const { code, message } = errorParser(error)
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
//     }
// }

// Dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const response = await getDashboardStatsService(req, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


// Clients
export const getClients = async (req: Request, res: Response) => {
    try {
        const response = await getClientsService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getAClient = async (req: Request, res: Response) => {
    try {
        const response = await getAClientService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const response = await deleteClientService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateClient = async (req: Request, res: Response) => {
    try {
        const response = await updateClientService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });

    }
}

export const addClientBilling = async (req: Request, res: Response) => {
    try {
        const response = await addClientBillingService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getClientBillings = async (req: Request, res: Response) => {
    try {
        const response = await getClientBillingService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const addClientServiceAssignment = async (req: Request, res: Response) => {
    try {
        const response = await addClientServiceAssignmentService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getClientServiceAssignment = async (req: Request, res: Response) => {
    try {
        const response = await getClientServiceAssignmentService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}
// Therapists
export const getTherapists = async (req: Request, res: Response) => {
    try {
        const response = await getTherapistsService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateTherapist = async (req: Request, res: Response) => {
    const validation = updateTherapistSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
    try {
        const response = await updateTherapistService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteTherapist = async (req: Request, res: Response) => {
    try {
        const response = await deleteTherapistService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


// export const updateDashboardStats = async (req: Request, res: Response) => {
//     const validation = dashboardSchema.safeParse(req.body)
//     if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
//     try {
//         const response = await updateDashboardStatsService(req.body, res)
//         return res.status(httpStatusCode.OK).json(response)

//     } catch (error) {
//         return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "An error occurred" });
//     }
// }



