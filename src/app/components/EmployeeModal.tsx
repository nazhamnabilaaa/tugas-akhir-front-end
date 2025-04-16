"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import useAxios from "../useAxios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface Employee {
  nmpeg: string;
  nip: string;
  kdjab: string;
  kdkawin: string;
  gaji_bersih: string;
  nogaji: string;
  bulan: string;
  tahun: string;
  kdgol: string;
  kdduduk: string;
  npwp: string;
  nmrek: string;
  nm_bank: string;
  rekening: string;
  kdbankspan: string;
  nmbankspan: string;
  kdnegara: string;
  kdkppn: string;
  kdpos: string;
  gjpokok: string;
  kdgapok: string;
  bpjs: string;
  kdanak: string;
  kdsubanak: string;
  KodeUpload: string;
}

interface AnakSatkerData {
  kdanak: string;
  nmanak: string;
  modul: string;
  kdsatker: string;
}

interface RestoreData {
  kdanak: string;
  KodeUpload: string;
  bulan: string;
  tahun: string;
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Employee) => void;
  initialData: Employee | null;
  mode: "add" | "edit";
}

const initialEmployeeData: Employee = {
  nmpeg: "",
  nip: "",
  kdjab: "",
  kdkawin: "",
  gaji_bersih: "",
  nogaji: "",
  bulan: "",
  tahun: "",
  kdgol: "",
  kdduduk: "",
  npwp: "",
  nmrek: "",
  nm_bank: "",
  rekening: "",
  kdbankspan: "",
  nmbankspan: "",
  kdnegara: "",
  kdkppn: "",
  kdpos: "",
  gjpokok: "",
  kdgapok: "",
  bpjs: "",
  kdanak: "",
  kdsubanak: "",
  KodeUpload: "",
};

const labelMap: { [key: string]: string } = {
  nmpeg: "Nama Dosen",
  nip: "NIP",
  kdjab: "Kode Jabatan",
  kdkawin: "Kode Kawin",
  gaji_bersih: "Gaji Bersih",
  nogaji: "Nomor Gaji",
  bulan: "Bulan",
  tahun: "Tahun",
  kdgol: "Kode Golongan",
  kdduduk: "Kode Kedudukan",
  npwp: "NPWP",
  nmrek: "Nama Rekening",
  nm_bank: "Nama Bank",
  rekening: "Nomor Rekening",
  kdbankspan: "Kode Bank Span",
  nmbankspan: "Nama Bank Span",
  kdnegara: "Kode Negara",
  kdkppn: "Kode KPPN",
  kdpos: "Kode Pos",
  gjpokok: "Gaji Pokok",
  kdgapok: "Kode Gaji Pokok",
  bpjs: "BPJS",
  kdanak: "Kode Anak",
  kdsubanak: "Kode Sub Anak",
  KodeUpload: "Kode Upload",
};

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: EmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>(initialEmployeeData);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData(initialData);
    } else {
      setFormData(initialEmployeeData);
    }
  }, [initialData, mode, isOpen]);

  const [konfigurasi, setKonfigurasi] = useState<AnakSatkerData[]>([]);
  const [restore, setRestore] = useState<RestoreData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
  
    const getCabangsatker = async () => {
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
  
    getCabangsatker();
  }, [token, axiosInstance]);

  useEffect(() => {
    if (!token) return;
  
    const getRestore = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/upload-excel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Ambil hanya data yang bisa di-map
        setRestore(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data REstore");
      } finally {
        setLoading(false);
      }
    };
  
    getRestore();
  }, [token, axiosInstance]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  

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

      if (isUpdate && initialData?.nip) {
        response = await axiosInstance.patch(`${apiUrl}/pegawai/${initialData.nip}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await axiosInstance.post(`${apiUrl}/pegawai`, formData, {
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
        router.push("/admin/data-dosen/edit-pegawai");
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-[800px] min-w-[700px] w-full max-h-[90vh] overflow-y-auto z-50">
      <h2 className="text-2xl font-bold mb-4">
        {mode === "add" ? "Tambah" : "Edit"} Data Pegawai
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="block text-sm font-medium mb-1 capitalize"
            >
              {labelMap[key as keyof Employee] || key.replace(/_/g, " ")}
            </label>

            {/* Kondisi khusus untuk dropdown kdanak */}
            {key === "kdanak" ? (
              <select
                id={key}
                name={key}
                value={formData.kdanak}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kode Anak</option>
                {loading ? (
                  <option disabled>Loading...</option>
                ) : error ? (
                  <option disabled>Error: {error}</option>
                ) : (
                  konfigurasi.map((item) => (
                    <option key={item.kdanak} value={item.kdanak}>
                      {item.kdanak} - {item.nmanak}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="text"
                id={key}
                name={key}
                value={formData[key as keyof Employee]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}

        {/* Tombol Aksi */}
        <div className="col-span-3 flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FFBD59] text-white rounded-md hover:bg-gray-300"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#18439D] text-white rounded-md hover:bg-blue-600"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
);
}