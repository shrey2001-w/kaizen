const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const CURRENCY_SYMBOLS = { usd: "$", inr: "₹", eur: "€", gbp: "£" };
const currencySymbol = () =>
  CURRENCY_SYMBOLS[(process.env.PAYMENT_CURRENCY || "usd").toLowerCase()] || "";

// A table row that is skipped when the value is empty
const row = (label, value) =>
  value === undefined || value === null || String(value).trim() === ""
    ? ""
    : `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666666;font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#111111;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`;

/* ------------------------------------------------------------------
   Custom HTML email
------------------------------------------------------------------- */
const buildBookingHtml = (p) => {
  const isCash = /cash/i.test(p.paymentStatus || "");
  const brand = escapeHtml(p.projectName || "KAIZEN TRANSPORTATION");
  const symbol = currencySymbol();

  const banner = isCash
    ? `<div style="background:#FFF4E5;border:1px solid #F5C77E;border-radius:10px;padding:16px;margin:0 0 24px;">
         <p style="margin:0;font-size:15px;color:#7A4B00;font-weight:700;">Pay by cash</p>
         <p style="margin:6px 0 0;font-size:14px;color:#7A4B00;">
           Please pay <b>${symbol}${escapeHtml(p.amount)}</b> to the driver at pick-up.
         </p>
       </div>`
    : `<div style="background:#E8F7EC;border:1px solid #9AD8AC;border-radius:10px;padding:16px;margin:0 0 24px;">
         <p style="margin:0;font-size:15px;color:#13622B;font-weight:700;">Payment received</p>
         <p style="margin:6px 0 0;font-size:14px;color:#13622B;">
           We have received <b>${symbol}${escapeHtml(p.amount)}</b>. Thank you!
         </p>
       </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f4;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#111111;padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">${brand}</h1>
              <p style="margin:6px 0 0;color:#cccccc;font-size:13px;">Booking Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 16px;font-size:16px;color:#111111;">Hi ${escapeHtml(p.name)},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.6;">
                Thank you for booking with us. Your ride is confirmed. Here are your details:
              </p>

              ${banner}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${row("Booking ID", p.bookingId)}
                ${row("Ride type", p.rideOption)}
                ${row("Vehicle", p.carChoice)}
                ${row("Pick-up date", p.pickUpDate)}
                ${row("Pick-up time", p.pickUpTime)}
                ${row("Pick-up location", p.origins)}
                ${row("Drop-off location", p.destinations)}
                ${row("Stops", p.StopAddress)}
                ${row("Hours booked", p.hourlyService)}
                ${row("Airline", p.airline)}
                ${row("Flight number", p.flightNumber)}
                ${row("Passengers", p.numberPassengers)}
                ${row("Luggage", p.numberLuggage)}
                ${row("Car seats", p.numberCarSeats)}
                ${row("Seat option", p.seatOption)}
                ${row("Phone", p.phone)}
                ${row("Email", p.email)}
                ${row("Payment", p.paymentStatus)}
                ${row("Payment ID", p.paymentIntentId)}
                ${row("Total", p.amount ? `${symbol}${p.amount}` : "")}
              </table>

              ${p.addOns || ""}

              <p style="margin:28px 0 0;font-size:13px;color:#666666;line-height:1.6;">
                If anything looks wrong, just reply to this email and we will help you.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa;padding:16px;text-align:center;color:#999999;font-size:12px;">
              &copy; ${new Date().getFullYear()} ${brand}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/* ------------------------------------------------------------------
   Send
------------------------------------------------------------------- */
const sendEmail = async ({ email, params }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in .env");
  }

  // The sender MUST be a verified sender / domain in your Brevo account,
  // otherwise Brevo accepts the request but never delivers the email.
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "support@moralitransportation.com";
  const ownerEmail = process.env.OWNER_EMAIL || process.env.BREVO_OWNER_EMAIL;
  const isCash = /cash/i.test(params.paymentStatus || "");

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "KAIZEN TRANSPORTATION", email: senderEmail };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.replyTo = {
    email: process.env.BREVO_REPLY_TO || senderEmail,
    name: "Support Team",
  };
  if (ownerEmail) {
    sendSmtpEmail.cc = [{ email: ownerEmail }];
  }

  sendSmtpEmail.subject = isCash
    ? `Booking Confirmed (Pay by Cash) - ${params.bookingId}`
    : `Booking Confirmed - ${params.bookingId}`;
  sendSmtpEmail.htmlContent = buildBookingHtml(params);

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent to ${email}:`, response.messageId || response);
    return response;
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.text : error.message
    );
    throw error;
  }
};

module.exports = { sendEmail, escapeHtml };