"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Login } from "../../../../public/assets/img/logo";
import routes from "@/routes"; // Jika file ada di src/routes.ts
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");

  const apiUrl = "http://localhost:8080";

  const Auth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const response = await axios.post(
        `${apiUrl}/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data?.accessToken) {
        const { accessToken } = response.data;
        const decoded = jwtDecode(accessToken);
        const userRole = decoded.role.toLowerCase();

        // Simpan token di localStorage hanya di sisi client
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }

        // Atur header default Axios
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;

        // Navigasi berdasarkan peran pengguna
        if (userRole === "admin") {
          router.push("../../admin/dashboard");
        } else if (userRole === "bendahara") {
          router.push("../dosen/dashboard");
        } else {
          setMsg("Akun tidak dikenali.");
        }
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        setMsg(error.response.data.msg);
      } else {
        console.error("Error:", error.message);
        setMsg("Login gagal, silakan coba lagi.");
      }
    }
  };

  // Cek token saat pertama kali render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const userRole = decoded.role.toLowerCase();

          if (userRole === "admin") {
            router.push("../../admin/dashboard");
          } else if (userRole === "bendahara") {
            router.push("../dosen/dashboard");
          }
        } catch (err) {
          console.error("Token tidak valid:", err);
        }
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#D5A865]">
      <div className="bg-white rounded-3xl p-8 grid grid-cols-2 items-center gap-5 w-[900px]">
        <div>
          <Image
            src={Login}
            alt=""
            width={300}
            height={300}
            className="w-[500px] h-[400px]"
          />
        </div>
        <div className="flex-col items-center space-y-6">
          <h1 className="text-2xl w-96 text-black">
            Selamat Datang di Aplikasi Tunjangan Dosen
          </h1>

          {msg && <p className="text-red-500">{msg}</p>}

          <form className="w-full space-y-4" onSubmit={Auth}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-600">
                Username
              </label>
              <input
                type="username"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-gray-600">
                  Kata Sandi
                </label>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*******"
                required
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#18439D] text-white rounded-lg p-3 hover:bg-blue-700 transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
