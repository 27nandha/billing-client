import axios from "axios";

// Set base URL from .env file or use localhost as fallback
axios.defaults.baseURL = import.meta.env.VITE_API || "http://localhost:3000";

export default axios;
