import axios from "axios";

// Set base URL from .env file or use localhost as fallback
axios.defaults.baseURL = import.meta.env.VITE_API || "http://localhost:3000";

// Add interceptor to handle expired JWT tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axios;
