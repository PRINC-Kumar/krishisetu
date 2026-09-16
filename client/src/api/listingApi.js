import { api } from "./axios.js";

export const listingApi = {
  all: (params) =>
    api.get("/listings", {
      params,
    }),

  one: (id) => api.get(`/listings/${id}`),

  mine: () => api.get("/listings/mine"),

  create: (formData) =>
    api.post("/listings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    api.put(`/listings/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  remove: (id) => api.delete(`/listings/${id}`),
};
