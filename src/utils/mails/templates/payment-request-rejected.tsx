import * as React from 'react';
import { Html, Button, Head, Container, Img } from "@react-email/components";

interface EmailProps {
  therapistDetails: any;
}
const PaymentRequestRejected: React.FC<Readonly<EmailProps>> = (props) => {
  const { therapistDetails } = props;

  return (
    <Html lang="en">
      <Head>
        <title>Payment Rejected</title>
      </Head>
      <Container>
        <h1 style={{ color: "black" }}>Payment Request Rejected</h1>
        <p style={{ color: "black" }}>
          Hi {therapistDetails?.firstName + ' ' + therapistDetails?.lastName},
          Your payment request with ref no. <b>{String(therapistDetails?._id)}</b> is rejected by {therapistDetails?.statusChangedBy}.
        </p>
      </Container>
    </Html>
  );
}
export default PaymentRequestRejected;
