"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import routes from "@/routes"; // Pastikan path ini benar
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Dynamic import for AdminNavbar to match the one in the other file
const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
});

interface AnakSatkerData {
  kdanak: string;
  nmanak: string;
  modul: string;
  kdsatker: string;
} 

  export default function Page() {
    const axiosInstance = useAxios();
    const router = useRouter();
    const [token, setToken] = useState("");
    const [konfigurasi, setKonfigurasi] = useState<AnakSatkerData[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [namalengkap, setNamalengkap] = useState("");
      const [formData, setFormData] = useState({
        kdanak: "",
        kdtunjangan: "",
        bulan: "",
        tahun: new Date().getFullYear(),
        keterangan: "",
        tanggal: "",
      });
  
    const apiUrl = "http://localhost:8080";
  
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }, []);
  
  
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
  
    useEffect(() => {
      if (!token) return;
    
      const getSatker = async () => {
        try {
          const response = await axiosInstance.get(`${apiUrl}/cabangsatker`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          // Ambil hanya data yang bisa di-map
          setKonfigurasi(response.data.Data[0] || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          localStorage.removeItem("accessToken");
          router.push("/");
          setError("Gagal mengambil data Satuan Kerja Fakultas");
        } finally {
          setLoading(false);
        }
      };
    
      getSatker();
    }, [token, axiosInstance]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Update nilai sesuai dengan name input
      }));
    };
    
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const confirmation = await Swal.fire({
        title: "Simpan Data?",
        text: "Apakah Anda yakin ingin menyimpan data Tanggal Tunjangan Profesiini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Simpan!",
        cancelButtonText: "Batal",
      });
  
      if (!confirmation.isConfirmed) return;
    
      // Pastikan semua field terisi
      if (
        !formData.kdtunjangan ||
        !formData.bulan ||
        !formData.tahun ||
        !formData.keterangan ||
        !formData.tanggal ||
        !formData.kdanak
      ) {
        Swal.fire("Error", "Harap lengkapi semua Form!", "error");
        return;
      }
    
      try {
        const data = {
          kdtunjangan: formData.kdtunjangan,
          bulan: formData.bulan,
          tahun: formData.tahun,
          keterangan: formData.keterangan,
          tanggal: formData.tanggal,
          kdanak: formData.kdanak,
        };
    
        const response = await axiosInstance.post(`${apiUrl}/tanggalprofesi`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (response.status === 201) {
          Swal.fire("Data berhasil disimpan!", "", "success");
          router.push("/admin/pembayaran/tunjangan-profesi");
        } else {
          Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error");
        }
      } catch (error) {
        console.error("Error saat mengirim data:", error);
        Swal.fire("Error", "Terjadi kesalahan saat mengirim data!", "error");
      }
    };

    return (
      <div className="flex flex-col">
        <AdminNavbar />
        <div className="flex">
          <Sidebar />
          <section className="flex-1 text-black px-16">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
              <h2 className="text-2xl font-bold mb-4">TAMBAH TUNJANGAN PROFESI</h2>
  
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
  
  
                {/* Kode Anak */}
                <div>
                  <label className="text-gray-700 font-medium">Kode Anak</label>
                  <select name="kdanak" className="border rounded-lg p-2 w-full bg-gray-100" value={formData.kdanak} onChange={handleChange} required>
                    <option value="">Pilih Kode Anak</option>
                    {konfigurasi.map((item) => (
                      <option key={item.kdanak} value={item.kdanak}>{item.kdanak} - {item.nmanak}</option>
                    ))}
                  </select>
                </div>
  
                {/* Kode Tunjangan */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Kode Tunjangan</label>
                  <input
                    type="text"
                    className="border rounded-lg p-2 w-24 bg-gray-100"
                    name="kdtunjangan"
                    value={formData.kdtunjangan}
                    onChange={handleChange} 
                    required
                  />
                </div>
  
                 {/* Bulan */}
                 <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Bulan (1-12)</label>
                  <select
                    className="border rounded-lg p-2 w-100 bg-gray-100"
                    name="bulan"
                    value={formData.bulan}
                    onChange={handleChange} // Pastikan ada perubahan nilai
                    required
                  >
                    <option value="">Pilih Bulan</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
  
                 {/* Tahun */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Tahun</label>
                  <select
                    className="border rounded-lg p-2 w-100 bg-gray-100"
                    name="tahun"
                    value={formData.tahun}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Tahun</option>
                    {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => (
                      <option key={i} value={2020 + i}>
                        {2020 + i}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Tanggal */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Tanggal</label>
                  <input
                    type="date"
                    className="border rounded-lg p-2 w-1/3"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>
  
                {/* Keterangan */}
                <div className="flex items-start space-x-2">
                  <label className="text-gray-700 font-medium w-32">Keterangan</label>
                  <textarea
                    className="border rounded-lg p-2 w-5/6"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
  
                {/* Tombol Simpan */}
                <div className="flex justify-end">
                  <button type="submit" className="w-30 h-10 bg-[#004AAD] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer mt-4">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  }