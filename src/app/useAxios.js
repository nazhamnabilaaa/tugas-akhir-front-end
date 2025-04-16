import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const useAxios = () => {
  const router = useRouter();
  const axiosInstance = useRef(
    axios.create({
      baseURL: "http://localhost:8080",
      withCredentials: true,
    })
  ).current;

  const [, setIsRefreshing] = useState(false);
  const [failedRequests, setFailedRequests] = useState([]);

  const processQueue = (error, token = null) => {
    failedRequests.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    setFailedRequests([]);
  };

  const getNewAccessToken = async () => {
    setIsRefreshing(true);
    try {
      const response = await axiosInstance.post("/token");
      const { accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      return accessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      router.push("./dosen/login");
      processQueue(error, null);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const requestInterceptor = (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  };

  const responseInterceptor = async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await getNewAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  };

  useEffect(() => {
    const reqInterceptor = axiosInstance.interceptors.request.use(
      requestInterceptor,
      (error) => Promise.reject(error)
    );

    const resInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      responseInterceptor
    );

    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return axiosInstance;
};

export default useAxios;