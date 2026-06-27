import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const getApiBase = () => API_URL;

export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const role = localStorage.getItem("role") || "employee";
  config.headers["X-User-Role"] = role;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);