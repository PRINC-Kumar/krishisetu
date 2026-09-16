import { api } from "./axios.js";
export const mandiApi = { all: () => api.get("/mandi-prices") };
