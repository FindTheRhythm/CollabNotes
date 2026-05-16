import axios, { AxiosInstance } from "axios";
import { logError, parseError } from "@/utils/errorHandler";

// In production (static build served from nginx) prefer a relative API path so
// the browser will call the same origin `/api` which the reverse-proxy forwards
// to the backend. In development fall back to the local backend port.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:3000/api");

if (!import.meta.env.VITE_API_URL) {
  console.info(`[API CLIENT] VITE_API_URL not provided, using ${API_URL}`);
}

console.log(`[API CLIENT] Initializing with API_URL: ${API_URL}`);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API CLIENT] Token attached to request: ${token.slice(0, 20)}...`);
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API CLIENT] 📤 ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error(`[API CLIENT] Request error:`, error);
    logError(error, "Request Interceptor");
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`[API CLIENT] 📥 ${response.status} ${response.config.url}`, {
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error details
    console.error(`[API CLIENT] Response error:`, {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log(`[API CLIENT] Attempting token refresh...`);
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log(`[API CLIENT] Token refreshed successfully`);
        return api(originalRequest);
      } catch (refreshError) {
        console.error(`[API CLIENT] Token refresh failed:`, refreshError);
        logError(refreshError, "Token Refresh");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Log all other errors with details
    const errorDetails = parseError(error);
    if (import.meta.env.DEV) {
      console.error(`[API CLIENT] ❌ ${errorDetails.statusCode} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
      console.error("[API CLIENT] Error details:", errorDetails);
    }

    return Promise.reject(error);
  }
);

export default api;

