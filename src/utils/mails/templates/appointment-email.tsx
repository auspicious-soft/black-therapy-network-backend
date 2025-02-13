import * as React from 'react';
import { Html, Button, Head, Container, Text, Img } from "@react-email/components";
import { configDotenv } from 'dotenv';
import { customerAppointmentsRoute } from 'src/lib/constant';
configDotenv();

interface AppointmentReminderProps {
    time: "before24hrs" | "before1hr" | "onAppointmentStart" | "onBookingAppointment";
    appointmentDetails: {
        clientName: string;
        dateTime: string;
    };
}

const AppointmentReminder: React.FC<Readonly<AppointmentReminderProps>> = ({ time, appointmentDetails }) => {
    const getReminderContent = () => {
        switch (time) {
            case "before24hrs":
                return {
                    title: "24 Hour Appointment Reminder",
                    message: `This is a reminder that you have an appointment tomorrow ${appointmentDetails.dateTime}.`
                };
            case "before1hr":
                return {
                    title: "1 Hour Appointment Reminder",
                    message: `Your appointment is starting in about 1 hour ${appointmentDetails.dateTime}.`
                };
            case "onAppointmentStart":
                return {
                    title: "Your Appointment Is Starting",
                    message: `Your appointment is starting now.`
                };
            case "onBookingAppointment":
                return {
                    title: "Appointment Confirmation",
                    message: `Your appointment has been scheduled for ${appointmentDetails.dateTime}.`
                };
        }
    };

    const content = getReminderContent();

    return (
        <Html lang="en">
            <Head>
                <title>Black Therapy Network</title>
            </Head>
            <Container style={{ margin: "0 auto", padding: "20px" }}>
                <Img
                    src="https://black-therapy-bucket.s3.us-east-1.amazonaws.com/btn-logo.png"
                    alt="Black Therapy Network"
                    width="150"
                    height="50"
                    style={{ marginBottom: "20px" }}
                />
                {content.title}
                <h1 style={{
                    color: "#000",
                    fontSize: "24px",
                    marginBottom: "20px",
                    fontFamily: "Arial, sans-serif"
                }}>
                    {content.title}
                </h1>
                <Text style={{
                    color: "#333",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    marginBottom: "15px"
                }}>
                    Dear {appointmentDetails.clientName},
                </Text>
                <Text style={{
                    color: "#333",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    marginBottom: "15px"
                }}>
                    {content.message}
                </Text>
                <Text style={{
                    color: "#333",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    marginBottom: "20px"
                }}>
                    Session Duration: 1hr
                </Text>
                <Button
                    href={customerAppointmentsRoute}
                    style={{
                        backgroundColor: "#000",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontWeight: "bold",
                        textAlign: "center",
                        display: "inline-block"
                    }}
                >
                    View Appointment Details
                </Button>
                <Text style={{
                    color: "#666",
                    fontSize: "14px",
                    marginTop: "40px",
                    textAlign: "center"
                }}>
                    © {new Date().getFullYear()} Black Therapy Network. All rights reserved.
                </Text>
            </Container>
        </Html>
    );
};

export default AppointmentReminder;