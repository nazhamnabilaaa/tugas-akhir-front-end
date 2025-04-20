"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import useAxios from "../useAxios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface AnakSatkerData {
  kdanak: string;
  nmanak: string;
  modul: string;
  kdsatker: string;
}

interface KonfigurasiSatker {
  kdsatker: string;
  nmsatker: string;
  kdkppn: string;
  nmkppn: string;
  email: string;
  notelp: string;
  npwp: string;
  nmppk: string;
  kota: string;
  provinsi: string;
  alamat: string;
}

interface AnakSatkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AnakSatkerData) => void;
  editData?: AnakSatkerData;
  mode: "add" | "edit";
}

const AnakSatker: React.FC<AnakSatkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  mode,
}) => {
  const defaultFormData: AnakSatkerData = {
    kdanak: "",
    nmanak: "",
    modul: "",
    kdsatker: "",
  };

  useEffect(() => {
    if (editData && mode === "edit") {
      setFormData(editData);
    } else {
      setFormData({
        kdanak: "",
        nmanak: "",
        modul: "",
        kdsatker: "",
      });
    }
  }, [editData, mode, isOpen]);

   const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSatker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AnakSatkerData>(defaultFormData);
  const axiosInstance = useAxios();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [namalengkap, setNamalengkap] = useState("");

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

  useEffect(() => {
    if (!token) return;
  
    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/satkeruniv`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Ambil hanya data yang bisa di-map
        setKonfigurasi(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data Satuan Kerja Universitas");
      } finally {
        setLoading(false);
      }
    };
  
    getSatker();
  }, [token, axiosInstance]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.kdsatker || !formData.kdanak) {
      Swal.fire("Error", "Kode Satker dan Kode Anak wajib diisi!", "error");
      return;
    }

    const isUpdate = mode === "edit";
    const confirmation = await Swal.fire({
      title: isUpdate ? "Update Data?" : "Simpan Data?",
      text: isUpdate ? "Apakah Anda yakin ingin memperbarui data ini?" : "Apakah Anda yakin ingin menyimpan data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isUpdate ? "Ya, Update!" : "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const token = localStorage.getItem("token") || "";
      let response;

      if (isUpdate && editData?.kdanak) {
        response = await axiosInstance.patch(`${apiUrl}/cabangsatker/${editData.kdanak}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await axiosInstance.post(`${apiUrl}/cabangsatker`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Sukses!", isUpdate ? "Data berhasil diperbarui." : "Data berhasil disimpan.", "success");
        onSave(formData);
        onClose();
        router.push("/admin/setting/konfigurasi-anak-satker");
      } else {
        Swal.fire("Gagal!", "Gagal menyimpan data, coba lagi nanti.", "error");
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-4">
        <h2 className="text-2xl font-bold mb-6">
          R/U/H KONFIGURASI ANAK SATKER
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Kode Satker</label>
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <select
                value={formData.kdsatker}
                onChange={(e) => setFormData({ ...formData, kdsatker: e.target.value })}
                className="w-full p-3 border rounded bg-gray-200"
                required
              >
                <option value="">Pilih Kode Satker</option>
                {konfigurasi.map((satker) => (
                  <option key={satker.kdsatker} value={satker.kdsatker}>
                    {satker.kdsatker} - {satker.nmsatker}
                  </option>
                ))}
              </select>
            )}
          </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Kode Anak
              </label>
              <input
                type="text"
                value={formData.kdanak}
                onChange={(e) =>
                  setFormData({ ...formData, kdanak: e.target.value })
                }
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Anak
              </label>
              <input
                type="text"
                value={formData.nmanak}
                onChange={(e) =>
                  setFormData({ ...formData, nmanak: e.target.value })
                }
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>


            <div>
              <label className="block text-sm font-medium mb-2">
                Jenis Menu / Modul
              </label>
              <div className="relative">
                <select
                  value={formData.modul}
                  onChange={(e) => setFormData({ ...formData, modul: e.target.value })}
                  className="w-full p-3 border rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                >
                  <option value="modul">Pilih Modul!</option>
                  <option value="PNS">PNS</option>
                  <option value="non-PNS">Non PNS</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#FFB84C] text-white rounded hover:bg-[#FFA82C] transition-colors font-medium"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0066CC] text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnakSatker;
