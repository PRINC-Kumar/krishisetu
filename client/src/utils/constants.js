export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const states = [
  "Maharashtra",
  "Punjab",
  "Gujarat",
  "Karnataka",
  "Uttar Pradesh",
  "Madhya Pradesh",
];
export const districts = [
  "Pune",
  "Nashik",
  "Nagpur",
  "Amritsar",
  "Ahmedabad",
  "Indore",
];
export const districtsByState = {
  Maharashtra: ["Pune", "Nashik", "Nagpur"],
  Punjab: ["Amritsar", "Ludhiana", "Jalandhar"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Karnataka: ["Bengaluru Urban", "Mysuru", "Belagavi"],
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Varanasi"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior"],
};
export const orderSteps = ["Pending", "Accepted", "Shipped", "Delivered"];
