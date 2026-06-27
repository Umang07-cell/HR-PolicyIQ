import axios from "axios";

// client.ts
const API_URL = import.meta.env.VITE_API_URL || "/api";
export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const role = localStorage.getItem("role") || "employee";
  config.headers["X-User-Role"] = role;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);
