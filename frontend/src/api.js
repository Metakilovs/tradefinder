import axios from "axios";

// While developing locally this points at your local backend.
// When you deploy, change VITE_API_URL in a .env file at the frontend root,
// e.g. VITE_API_URL=https://your-backend.onrender.com/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

// Attach the saved login token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
