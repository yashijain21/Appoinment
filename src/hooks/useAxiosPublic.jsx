import axios from "axios";

// 🌐 Base URL for Render-deployed backend
export const baseUrl = "https://steammaster-backend-3.onrender.com/api";

const axiosPublic = axios.create({
  baseURL: baseUrl,
  withCredentials: false, // Set to true only if you're using cookies/session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
