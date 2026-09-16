import bcrypt from "bcryptjs";

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));
export const hashOtp = (otp) => bcrypt.hash(otp, 10);
export const verifyOtp = (otp, hash) => bcrypt.compare(otp, hash);
