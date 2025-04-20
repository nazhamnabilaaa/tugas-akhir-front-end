"use client";

import React, { useEffect } from "react";
import { Hero } from "../_section";
import Navbar from "@/components/navbar/navbar";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

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
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, [router]); // Menambahkan `router` ke dependency array untuk menghindari warning

  return (
    <main className="px-16">
      <Navbar />
      <Hero />
    </main>
  );
}
