import twilio from 'twilio'
import { configDotenv } from "dotenv"
import { customerAppointmentsRoute } from 'src/lib/constant'

configDotenv()

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    autoRetry: true,
    maxRetries: 2,
})

export const sendAppointmentTexts = async (time: "before24hrs" | "before1hr" | "onAppointmentStart" | "onBookingAppointment", recipient: string) => {
    const websiteUrl = customerAppointmentsRoute;
    let body = `Your appointment is ${time}!`
    
    switch (time) {
        case "before24hrs":
            body = `Your appointment is in 24 hours! View details at: ${websiteUrl}`;
            break;
        case "before1hr":
            body = `Your appointment is in less than 1 hour! Join here: ${websiteUrl}`;
            break;
        case "onAppointmentStart":
            body = `Your appointment is starting now! Join here: ${websiteUrl}`;
            break;
        case "onBookingAppointment":
            body = `Your appointment has been booked! View details at: ${websiteUrl}`;
            break;
        default:
            body = `Your appointment status has been updated! Check details at: ${websiteUrl}`;
    }
    try {
        const message = await twilioClient.messages.create({
            body: body,
            from: TWILIO_PHONE_NUMBER,
            to: recipient,
        })
        return message
    } catch (error) {
        console.error('Error sending appointment texts:', error)
        throw error
    }
}