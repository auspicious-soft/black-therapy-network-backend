import * as React from 'react';
import { Html, Head, Container } from "@react-email/components";

interface EmailProps {
  otp: string;
}

const ForgotPasswordEmail: React.FC<Readonly<EmailProps>> = (props) => {
  const { otp } = props;

  return (
    <Html lang="en">
      <Head>
        <title>Password Reset OTP</title>
      </Head>
      <Container>
        <h1 style={{ color: "black" }}>Password Reset</h1>
        <p style={{ color: "black" }}>
          Use the OTP below to reset your password:
        </p>
        <h2 style={{ color: "#007bff" }}>{otp}</h2>
        <p style={{ color: "#6c757d" }}>
          If you did not request a password reset, please ignore this email.
        </p>
      </Container>
    </Html>
  );
};

export default ForgotPasswordEmail;