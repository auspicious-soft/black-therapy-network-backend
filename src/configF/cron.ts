import { appointmentRequestModel } from "src/models/appointment-request-schema";

export async function sendAppointmentNotifications() {
    const now = new Date();
    console.log('now: ', now.getTime());
    const appointments:any = await appointmentRequestModel.find({
        appointmentDate: { $gte: now },
        status: "Pending"
    })
    console.log('appointments: ', new Date(appointments[0]?.appointmentDate));

    appointments.forEach(async (appointment:any) => {
        const appointmentTime = new Date(appointment.appointmentDate!)
        console.log('appointmentTime: ', appointmentTime.toString().split('T')[0]);
        const timeDiff = appointmentTime.getTime() - now.getTime();

        // if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 23 * 60 * 60 * 1000 && !appointment.notificationSent.before24hrs) {
        //     // await sendEmailNotification(appointment);
        //     appointment.notificationSent.before24hrs = true;
        //     await appointment.save();
        // } 
        // else if (timeDiff <= 60 * 60 * 1000 && timeDiff > 59 * 60 * 1000 && !appointment.notificationSent.before1hr) {
        //     // await sendSMSNotification(appointment);
        //     appointment.notificationSent.before1hr = true;
        //     await appointment.save();
        // } 
        // else if (timeDiff <= 0 && !appointment.notificationSent.onAppointmentStart) {
        //     // await sendEmailNotification(appointment);
        //     // await sendSMSNotification(appointment);
        //     appointment.notificationSent.onAppointmentStart = true;
        //     await appointment.save();
        // }
    })
}
