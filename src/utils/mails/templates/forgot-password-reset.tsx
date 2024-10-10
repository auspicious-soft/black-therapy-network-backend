import * as React from 'react';

import { Html, Button, Head, Container, Img } from "@react-email/components";
interface EmailProps {
  url: string;
}
const ForgotPasswordEmail: React.FC<Readonly<EmailProps>> = (props) => {
  const { url } = props;

  return (
    <Html lang="en">
      <Head>
        <title>Reset your password</title>
      </Head>
      <Container>
        <h1 style={{ color: "black" }}>Reset your password</h1>
        <p style={{ color: "black" }}>Click the link below to reset your password</p>
        <Button style={{ color: "white", borderRadius: "4px", padding: "10px", backgroundColor: "#007bff" }} target='_blank' href={url}>Reset password</Button>
        <p style={{ color: "#6c757d" }}>If you did not request a password reset, please ignore this email.</p>
      </Container>
    </Html>
  );
}
export default ForgotPasswordEmail