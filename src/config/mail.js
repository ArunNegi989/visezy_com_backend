import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});
console.log({
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD:
    process.env.SMTP_PASSWORD ? "FOUND" : "NOT FOUND",
});
export default transporter;