import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 1000, // 10s
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("🔄 Token expirado. Intentando refresh...");

            const refreshToken = sessionStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post("http://localhost:8000/api/auth/token/refresh/", {
                        refresh: refreshToken,
                    });

                    const newAccessToken = res.data.access;
                    sessionStorage.setItem("accessToken", newAccessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("❌ Error al refrescar token:", refreshError);
                    window.location.href = "/login"; // fuerza login
                }
            } else {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
