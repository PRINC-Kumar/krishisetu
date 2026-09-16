import { api } from "./axios.js";

export const orderApi = {
  create: (payload) => api.post("/orders", payload),
  mine: () => api.get("/orders/mine"),
  status: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  dispute: (id, payload) => api.patch(`/orders/${id}/dispute`, payload),
};
