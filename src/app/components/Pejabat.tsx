"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import useAxios from "../useAxios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface PejabatData {
  kdanak: string;
  nip: string;
  nik: string;
  nmpeg: string;
  nmjab: string;
  kdjab: string;
  kdduduk: string;
  nmduduk: string;
  jurubayar: string;
}

interface AnakSatkerData {
  kdanak: string;
  nmanak: string;
  modul: string;
  kdsatker: string;
}

interface PejabatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PejabatData) => void;
  editData?: PejabatData;
  mode: "add" | "edit";
}

const Pejabat: React.FC<PejabatModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  mode,
}) => {
  const defaultFormData: PejabatData = {
    kdanak: "",
    nip: "",
    nik: "",
    nmpeg: "",
    nmjab: "",
    kdjab: "",
    kdduduk: "",
    nmduduk: "",
    jurubayar: "",
  };


  useEffect(() => {
    if (editData && mode === "edit") {
      setFormData(editData);
    } else {
      setFormData({
        kdanak: "",
        nip: "",
        nik: "",
        nmpeg: "",
        nmjab: "",
        kdjab: "",
        kdduduk: "",
        nmduduk: "",
        jurubayar: "",
      });
    }
  }, [editData, mode, isOpen]);

  const [konfigurasi, setKonfigurasi] = useState<AnakSatkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PejabatData>(defaultFormData);
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


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.kdanak || !formData.nip) {
      Swal.fire("Error", "Kode Anak dan NIP wajib diisi!", "error");
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

      if (isUpdate && editData?.nip) {
        response = await axiosInstance.patch(`${apiUrl}/ruhpejabat/${editData.nip}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await axiosInstance.post(`${apiUrl}/ruhpejabat`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Sukses!", isUpdate ? "Data berhasil diperbarui." : "Data berhasil disimpan.", "success");
        onSave(formData);
        window.location.reload();
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
        <h2 className="text-2xl font-bold mb-6">R/U/H Pejabat</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kode Anak */}
            <div>
              <label className="block text-sm font-medium mb-2">Kode Anak</label>
              {loading ? (
                <p className="text-gray-500">Memuat data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <select
                  value={formData.kdanak}
                  onChange={(e) => setFormData({ ...formData, kdanak: e.target.value })}
                  className="w-full p-3 border rounded bg-gray-200"
                  required
                >
                  <option value="">Pilih Kode Anak</option>
                  {konfigurasi.map((cabangsatker) => (
                    <option key={cabangsatker.kdsatker} value={cabangsatker.kdanak}>
                      {cabangsatker.kdanak} - {cabangsatker.nmanak}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Nama Pejabat */}
            <div>
              <label className="block text-sm font-medium mb-2">Nama Pejabat</label>
              <input
                type="text"
                value={formData.nmpeg}
                onChange={(e) => setFormData({ ...formData, nmpeg: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* NIP / NRP */}
            <div>
              <label className="block text-sm font-medium mb-2">NIP / NRP</label>
              <input
                type="text"
                maxLength={18}
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* NIK */}
            <div>
              <label className="block text-sm font-medium mb-2">NIK</label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Kode Jabatan */}
            <div>
              <label className="block text-sm font-medium mb-2">Kode Jabatan</label>
              <input
                type="text"
                value={formData.kdjab}
                onChange={(e) => setFormData({ ...formData, kdjab: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Jabatan */}
            <div>
              <label className="block text-sm font-medium mb-2">Jabatan</label>
              <input
                type="text"
                value={formData.nmjab}
                onChange={(e) => setFormData({ ...formData, nmjab: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Kode Kedudukan */}
            <div>
              <label className="block text-sm font-medium mb-2">Kode Kedudukan</label>
              <input
                type="text"
                value={formData.kdduduk}
                onChange={(e) => setFormData({ ...formData, kdduduk: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Nama Kedudukan */}
            <div>
              <label className="block text-sm font-medium mb-2">Nama Kedudukan</label>
              <input
                type="text"
                value={formData.nmduduk}
                onChange={(e) => setFormData({ ...formData, nmduduk: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Juru Bayar (TNI) */}
            <div>
              <label className="block text-sm font-medium mb-2">Juru Bayar (TNI)</label>
              <input
                type="text"
                value={formData.jurubayar}
                onChange={(e) => setFormData({ ...formData, jurubayar: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Tombol Aksi */}
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

export default Pejabat;
