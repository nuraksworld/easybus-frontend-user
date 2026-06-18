// src/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Save/remove token
export function setAuthToken(token) {
  if (token) localStorage.setItem("easybus_token", token);
  else localStorage.removeItem("easybus_token");
}

// Attach token to every request
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("easybus_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
