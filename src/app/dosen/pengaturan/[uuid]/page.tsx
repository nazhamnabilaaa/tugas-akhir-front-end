"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/navbar"; // Import the Navbar component
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

// interface Users {
//   uuid: string;
//   username: string;
//   namalengkap: string;
//   email: string;
//   nip: string;
//   notelp: string;
//   alamat: string;
//   role: string;
// }

export default function Page() {
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confNewPassword: "",
  });
  const axiosInstance = useAxios();
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid ?? ""; // memastikan uuid terisi
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
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, [router]);

  useEffect(() => {
    if (!token || !uuid) {
      console.warn("Token atau uuid belum tersedia, menunggu...");
      return;
    }

    const GetUsersByUUID = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/users/${uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.Data && response.data.Data.length > 0) {
          // Tidak perlu mendeklarasikan `detailData` karena tidak digunakan
        } else {
          console.warn("Data tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    GetUsersByUUID();
  }, [uuid, token, axiosInstance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword || !formData.confNewPassword) {
      await Swal.fire({
        title: "Error",
        text: "Harap lengkapi semua form!",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    if (formData.newPassword !== formData.confNewPassword) {
      await Swal.fire({
        title: "Error",
        text: "Password baru dan konfirmasi tidak cocok!",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin Mengupdate Kata Sandi Pengguna ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axiosInstance.patch(
        `${apiUrl}/usersEditPassword/${uuid}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        await Swal.fire({
          title: "Sukses",
          text: "Password berhasil diperbarui!",
          icon: "success",
          confirmButtonText: "OK"
        });
        window.location.reload();
      } else {
        await Swal.fire({
          title: "Gagal",
          text: response.data.msg || "Terjadi kesalahan!",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      await Swal.fire({
        title: "Error",
        text: error.response.data.msg,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  return (
    <section className="text-black px-16">
      <Navbar />
      <div className="text-black flex justify-center items-center">
        <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-lg mt-10 flex flex-col justify-center items-center ">
          <div className="flex justify-between items-center mb-4 w-full">
            <h2 className="text-2xl font-bold text-center w-full">
              Ubah Kata Sandi
            </h2>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8 w-full justify-center items-center">
            <div className="flex-1 space-y-4 w-full max-w-md">
              <div className="space-y-2">
                <div>
                  <label className="text-xl text-black" htmlFor="name">
                    Kata Sandi Lama
                  </label>
                </div>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="border rounded-xl py-2 px-4 w-full focus:outline-none focus:ring"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xl text-black" htmlFor="name">
                    Kata Sandi Baru
                  </label>
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="border rounded-xl py-2 px-4 w-full focus:outline-none focus:ring"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xl text-black" htmlFor="nip">
                    Konfirmasi Kata Sandi Baru
                  </label>
                </div>
                <input
                  type="password"
                  id="confNewPassword"
                  name="confNewPassword"
                  value={formData.confNewPassword}
                  onChange={handleChange}
                  className="border rounded-xl py-2 px-4 w-full focus:outline-none focus:ring"
                />
              </div>
              <div className="mt-6 flex justify-center w-full">
                <button className="w-full py-2 bg-[#004AAD] text-white font-semibold rounded-xl hover:bg-gray-300 transition duration-200 mt-4"
                  onClick={handleSubmit}>
                  Simpan
                </button>
              </div>
              <div className="mt-4 mb-2 w-full border-t border-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
