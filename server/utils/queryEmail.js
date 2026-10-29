const SibApiV3Sdk = require("sib-api-v3-sdk");

// Configure API client once
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY || "";

const OWNER_EMAIL = process.env.BREVO_OWNER_EMAIL || "bhattshrey21@gmail.com";
const SENDER = {
  name: "KAIZEN TRANSPORTATION",
  email: process.env.BREVO_SENDER_EMAIL || "bhattshrey21@gmail.com", // must be verified in Brevo
};

// Prevents HTML injection from user-submitted form data
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Email to the owner with all details
const ownerHtml = ({ name, email, phone, message }) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden">
  <div style="background:#111;color:#fff;padding:16px 24px">
    <h2 style="margin:0">New Enquiry - KAIZEN TRANSPORTATION</h2>
  </div>
  <div style="padding:24px;color:#222">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px 0;font-weight:bold;width:110px">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;vertical-align:top">Message</td><td style="white-space:pre-wrap">${escapeHtml(message)}</td></tr>
    </table>
  </div>
</div>`;

// Confirmation email to the customer
const customerHtml = ({ name, message }) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden">
  <div style="background:#111;color:#fff;padding:16px 24px">
    <h2 style="margin:0">Thank you for contacting us!</h2>
  </div>
  <div style="padding:24px;color:#222">
    <p>Hi ${escapeHtml(name)},</p>
    <p>We have received your message and our team will get back to you shortly.</p>
    <p style="font-weight:bold;margin-bottom:4px">Your message:</p>
    <p style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(message)}</p>
    <p>Regards,<br/>KAIZEN TRANSPORTATION</p>
  </div>
</div>`;

// Extract the real Brevo error message
const brevoError = (err) =>
  err?.response?.body?.message ||
  err?.response?.text ||
  err?.message ||
  "Unknown Brevo error";

export const queryEmail = async ({ name, email, phone, message }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing in .env");
  }

  const api = new SibApiV3Sdk.TransactionalEmailsApi();

  // 1) Owner email
  const toOwner = new SibApiV3Sdk.SendSmtpEmail();
  toOwner.sender = SENDER;
  toOwner.to = [{ email: OWNER_EMAIL, name: "Owner" }];
  toOwner.replyTo = { email, name }; // "Reply" goes to the customer
  toOwner.subject = `New enquiry from ${name}`;
  toOwner.htmlContent = ownerHtml({ name, email, phone, message });

  // 2) Customer confirmation email
  const toCustomer = new SibApiV3Sdk.SendSmtpEmail();
  toCustomer.sender = SENDER;
  toCustomer.to = [{ email, name }];
  toCustomer.replyTo = { email: OWNER_EMAIL, name: "Support Team" };
  toCustomer.subject = "We received your message - KAIZEN TRANSPORTATION";
  toCustomer.htmlContent = customerHtml({ name, message });

  const results = await Promise.allSettled([
    api.sendTransacEmail(toOwner),
    api.sendTransacEmail(toCustomer),
  ]);

  const errors = [];
  if (results[0].status === "rejected")
    errors.push("Owner email: " + brevoError(results[0].reason));
  if (results[1].status === "rejected")
    errors.push("Customer email: " + brevoError(results[1].reason));

  if (errors.length) {
    console.error("Brevo errors:", errors);
    throw new Error(errors.join(" | "));
  }

  return results;
};