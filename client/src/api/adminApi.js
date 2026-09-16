import { api } from "./axios.js";
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  users: () => api.get("/admin/users"),
  verifyFarmer: (id, isVerified) =>
    api.patch(`/admin/farmers/${id}/verify`, { isVerified }),
  listings: () => api.get("/admin/listings"),
  orders: () => api.get("/admin/orders"),
  dispute: (id, payload) => api.patch(`/admin/orders/${id}/dispute`, payload),
};
