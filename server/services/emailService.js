import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

const getTransporter = () => {
  if (!env.emailHost || !env.emailUser || !env.emailPassword || !env.emailFrom) {
    throw new Error("Email service is not configured");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: {
        user: env.emailUser,
        pass: env.emailPassword,
      },
    });
  }

  return transporter;
};

export const sendPasswordResetOtp = async (email, otp) => {
  await getTransporter().sendMail({
    from: env.emailFrom,
    to: email,
    subject: "KrishiSetu password reset OTP",
    text: [
      "KrishiSetu password reset",
      "",
      `Your one-time password is: ${otp}`,
      "This OTP is valid for 5 minutes.",
      "For your security, do not share this OTP with anyone.",
    ].join("\n"),
  });
};
