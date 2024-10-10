import { Resend } from "resend";
import ForgotPasswordEmail from "./templates/forgot-password-reset";
import { configDotenv } from "dotenv";
import PaymentRequestRejected from "./templates/payment-request-rejected";
configDotenv()  
const resend = new Resend(process.env.RESEND_API_KEY)  


export const sendPasswordResetEmail = async (email: string, token: string) => {
    const domain = process.env.NEXT_PUBLIC_APP_URL
    const resetLink = `${domain}?token=${token}`

    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Reset your password", 
        react: ForgotPasswordEmail({ url: resetLink }),
    })
}

export const paymentRequestRejectedEmail = async (email: string, result: any) => {
    const res = result.toObject()
    const therapist = { statusChangedBy: res.statusChangedBy, ...res.therapistId };
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Payment Request Rejected",
        react: PaymentRequestRejected({ therapistDetails: therapist }),
    })
}