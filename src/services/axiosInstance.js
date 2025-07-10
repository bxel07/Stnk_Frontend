import axios from "axios";

// Buat instance Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // pastikan /api ada kalau backend pakai itu
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: Tambahkan token JWT secara otomatis
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor: Handle error 401 (token expired / tidak valid)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token tidak valid / expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect ke halaman login
      window.location.href = "/";

      // Atau tampilkan pesan
      // toast.error("Sesi habis. Silakan login ulang.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
