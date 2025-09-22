import axios from "axios";

const api = axios.create({
  baseURL: "http://121.242.232.212:8086/itelinc/resources",
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
