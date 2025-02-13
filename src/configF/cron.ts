import { appointmentRequestModel } from "src/models/appointment-request-schema";
import { sendAppointmentEmail } from "src/utils/mails/mail";
import { sendAppointmentTexts } from "src/utils/texts/text";


export async function sendAppointmentNotifications() {
    const now = new Date()
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const localTime = `${localNow.getUTCHours().toString().padStart(2, '0')}:${localNow.getUTCMinutes().toString().padStart(2, '0')}`

    const todayDate = localNow.toISOString().split('T')[0]

    const appointments = await appointmentRequestModel.find({
        appointmentDate: {
            $gte: localNow.toISOString().split('T')[0]
        },
        $or: [
            { appointmentDate: { $ne: todayDate } },
            { 
                $and: [
                    { appointmentDate: todayDate },
                    { appointmentTime: { $gte: localTime } }
                ]
            }
        ],
        status: { $in: ["Pending", "Approved"] }
    }).populate('clientId therapistId')
    
    for (const appointment of appointments) {
        try {
            const appointmentDate = appointment.appointmentDate; // e.g., "2025-01-09T00:00:00.000Z"
            const appointmentTime = appointment.appointmentTime; // e.g., "21:00"

            // Parse the time components 
            const [hours, minutes] = appointmentTime!.split(":").map(Number)

            const appointmentDateTime = new Date(appointmentDate!);
            appointmentDateTime.setUTCHours(hours, minutes, 0, 0);


            // Calculate the time difference in hours
            const timeDifferenceInHours = (appointmentDateTime.getTime() - localNow.getTime()) / (1000 * 60 * 60)

            // 24 hour notification (email) 
            if (!appointment.notificationSent.before24hrs && timeDifferenceInHours <= 24 && timeDifferenceInHours > 1) {
                await Promise.all([
                    sendAppointmentEmail("before24hrs", (appointment as any).clientId.email, appointment),
                    // sendAppointmentEmail("before24hrs", (appointment as any).therapistId.email)
                ])
                appointment.notificationSent.before24hrs = true;
                await appointment.save();
            }

            // 1 hour notification (text)
            else if (!appointment.notificationSent.before1hr && timeDifferenceInHours <= 1 && timeDifferenceInHours > 0.10) {
                await Promise.all([
                    sendAppointmentEmail("before1hr", (appointment as any).clientId.email, appointment),
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