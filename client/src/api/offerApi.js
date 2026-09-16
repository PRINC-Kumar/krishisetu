import { api } from "./axios.js";
export const offerApi = {
  thread: (params) => api.get("/offers", { params }),
  create: (payload) => api.post("/offers", payload),
  decide: (id, status) => api.patch(`/offers/${id}/decision`, { status }),
};
