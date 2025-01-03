import { appointmentRequestModel } from "src/models/appointment-request-schema";
import { sendAppointmentEmail } from "src/utils/mails/mail";
import { sendAppointmentTexts } from "src/utils/texts/text";


export async function sendAppointmentNotifications() {
    // appointment time is in this format "21:00"
    // also include the time as well in query
    const now = new Date()
    console.log('now: ', now);
    // const timemHrAndMin = now.toISOString().split('T')[1].slice(0, 5)
    // const [hours, minutes] = timemHrAndMin.split(":").map(Number)
    const appointments = await appointmentRequestModel.find({ appointmentDate: { $gte: now }, status: "Pending" }).populate('clientId therapistId')
    console.log('appointments: ', appointments);

    for (const appointment of appointments) {
        try {
            const appointmentDate = appointment.appointmentDate; // e.g., "2025-01-09T00:00:00.000Z"
            const appointmentTime = appointment.appointmentTime; // e.g., "21:00"

            // Parse the time components
            const [hours, minutes] = appointmentTime!.split(":").map(Number)

            const appointmentDateTime = new Date(appointmentDate!);
            appointmentDateTime.setUTCHours(hours, minutes, 0, 0);


            const now = new Date();

            // Calculate the time difference in hours
            const timeDifferenceInHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            console.log('coming here');
            // 24 hour notification (email)
            if (!appointment.notificationSent.before24hrs && timeDifferenceInHours <= 24 && timeDifferenceInHours > 23) {
                await Promise.all([
                    sendAppointmentEmail("before24hrs", (appointment as any).clientId.email, appointment),
                    // sendAppointmentEmail("before24hrs", (appointment as any).therapistId.email)
                ]);
                appointment.notificationSent.before24hrs = true;
                await appointment.save();
            }
            // 1 hour notification (text)
            else if (!appointment.notificationSent.before1hr && timeDifferenceInHours <= 1 && timeDifferenceInHours > 0) {
                console.log('coming here 1 hour')
                await Promise.all([
                    sendAppointmentEmail("onAppointmentStart", 'delivered@resend.dev', appointment),
                    sendAppointmentTexts("before1hr", (appointment as any).clientId.phoneNumber),
                    // sendAppointmentTexts("before1hr", (appointment as any).therapistId.phoneNumber)
                ]);
                appointment.notificationSent.before1hr = true;
                await appointment.save();
            }

            // Start time notification (both email and text)
            else if (!appointment.notificationSent.onAppointmentStart && Math.abs(timeDifferenceInHours) < 0.10) { // Within 6 minutes of the appointment time
                await Promise.all([
                    sendAppointmentEmail("onAppointmentStart", (appointment as any).clientId.email, appointment),
                    // sendAppointmentEmail("onAppointmentStart", (appointment as any).therapistId.email),
                    sendAppointmentTexts("onAppointmentStart", (appointment as any).clientId.phoneNumber),
                    // sendAppointmentTexts("onAppointmentStart", (appointment as any).therapistId.phoneNumber)
                ]);
                appointment.notificationSent.onAppointmentStart = true;
                await appointment.save();
            }
        } catch (error) {
            console.error(`Error processing appointment ${appointment._id}:`, error);
            continue;
        }
    }
}