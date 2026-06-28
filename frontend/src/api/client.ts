import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getApiBase = () => API_URL;

export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  const role = localStorage.getItem("role") || "employee";
  config.headers["X-User-Role"] = role;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);