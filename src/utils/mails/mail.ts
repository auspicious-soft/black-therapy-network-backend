import { Resend } from "resend";
import ForgotPasswordEmail from "./templates/forgot-password-reset";
import { configDotenv } from "dotenv";
import PaymentRequestRejected from "./templates/payment-request-rejected";
import AppointmentReminder from "./templates/appointment-email";
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
    const therapist = { statusChangedBy: res.statusChangedBy, ...res.therapistId, rejectedMsg: result.rejectNote };
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Payment Request Rejected",
        react: PaymentRequestRejected({ therapistDetails: therapist }),
    })
}

export const sendAppointmentEmail = async (time: "before24hrs" | "before1hr" | "onAppointmentStart" | "onBookingAppointment", recipient: string, appointment: any) => {
    return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: recipient,
        subject: "Appointment Reminder",
        react: AppointmentReminder({
            time, appointmentDetails: {
                clientName: appointment.clientName,
                dateTime: `${new Date(appointment.appointmentDate).toLocaleDateString('en-US')}` + " at " + appointment.appointmentTime,
            }
        }),
    })
}


export const sendContactUsEmail = async ({ first, last, email, phone, type, message }: any) => {
    const subject = 'New Contact Form Submission';
    const body = `
        Name: ${first} ${last || ''}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        Type: ${type}
        Message: ${message}
    `;

   return await resend.emails.send({
        from: email,
        to: process.env.COMPANY_RESEND_GMAIL_ACCOUNT  as string, // Replace with your support email
        subject,
        text: body,
    });
}
export const addedUserCreds = async (payload: any) => {
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: payload.email,
        subject: "User Credentials",
        text: `Hello ${payload.fullName},\n\nYour account has been created with the following credentials:\n\nEmail: ${payload.email}\nPassword: ${payload.password}\nRole: ${payload.role}\n\nPlease keep this information secure.`,
    })
}
