"use client";

import React, {useState, useEffect} from "react";
import { Hero } from "../_section";
import Navbar from "@/components/navbar/navbar";
import routes from "@/routes"; // Jika file ada di src/routes.ts
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function Page() {
  const axiosInstance = useAxios();
  const [token, setToken] = useState("");
  const [namalengkap, setNamalengkap] = useState("");
  const router = useRouter();

  const apiUrl = "http://localhost:8080";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/");
      } else {
        try {
          const decoded = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
  
          if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired");
            localStorage.removeItem("accessToken"); // Hapus token expired
            router.push("/"); // Redirect ke login
          } else {
            setToken(accessToken);
            setNamalengkap(decoded.namalengkap);
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, []);

  return (
    <main className="px-16">
      <Navbar />
      <Hero />
    </main>
  );
}
