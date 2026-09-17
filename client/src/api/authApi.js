import { api } from "./axios.js";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  refresh: () => api.post("/auth/refresh"),
  requestOtp: (payload) => api.post("/auth/farmer/request-otp", payload),
  verifyOtp: (payload) => api.post("/auth/farmer/verify-otp", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
  verifyPasswordResetOtp: (payload) => api.post("/auth/verify-otp", payload),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};
