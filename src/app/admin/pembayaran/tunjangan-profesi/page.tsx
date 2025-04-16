"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar";
import { GrAddCircle } from "react-icons/gr";
import { TbTrash } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";
import Link from "next/link";
import { MdPayment } from "react-icons/md";
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
});

interface TanggalProfesi {
  kdtunjangan: string;
  bulan: string;
  tahun: string;
  keterangan: string;
  tanggal: string;
  kdanak: string;
}

export default function Page() {
  const [tanggalProfesi, setTanggalProfesi] = useState<TanggalProfesi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<TanggalProfesi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
            localStorage.removeItem("accessToken");
            router.push("/");
          } else {
            setToken(accessToken);
            setNamalengkap(decoded.namalengkap);
          }
        } catch (err) {
          router.push("/");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const getTanggalprofesi = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/tanggalprofesi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTanggalProfesi(response.data.Data[0] || []);
      } catch (error) {
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data Tanggal Tunjangan Profesi");
      } finally {
        setLoading(false);
      }
    };

    getTanggalprofesi();
  }, [token, axiosInstance]);

  const handleDelete = async (kdtunjangan: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`${apiUrl}/tanggalprofesi/${kdtunjangan}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTanggalProfesi((prev) =>
            prev.filter((item) => item.kdtunjangan !== kdtunjangan)
          );
          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success");
        } catch (error) {
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  const totalPages = Math.ceil(
    tanggalProfesi.filter((item) =>
      item.kdtunjangan.includes(searchTerm) ||
      item.kdanak.toLowerCase().includes(searchTerm.toLowerCase())
    ).length / entries
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = tanggalProfesi.filter((item) =>
      item.kdtunjangan.includes(searchTerm) ||
      item.kdanak.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const startIndex = (currentPage - 1) * entries;
    setFilteredData(filtered.slice(startIndex, startIndex + entries));
  }, [searchTerm, entries, tanggalProfesi, currentPage]);

  return (
    <div className="flex flex-col">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">TUNJANGAN PROFESI</h2>
            </div>
            <div className="flex justify-between items-center mb-4 mt-8">
              <div className="flex items-center space-x-2">
                <label htmlFor="entries" className="mr-2">
                  Tampilan
                </label>
                <select
                  id="entries"
                  className="border rounded p-2 w-32"
                  value={entries}
                  onChange={(e) => {
                    setEntries(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ml-2">Entri</span>
              </div>

              <div className="flex space-x-2">
                <Link
                  href="/admin/pembayaran/tambah-profesi"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <GrAddCircle className="text-2xl" />
                  <span className="text-black text-xs">Tambah</span>
                </Link>
                <input
                  type="text"
                  placeholder="Cari Kode Tunjangan atau Kode Anak"
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="mt-4 mb-2 w-full border-t border-gray-300" />
            <table className="min-w-full bg-white border-collapse border-black border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Kode Anak
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Kode Tunjangan
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Bulan
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Tahun
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Keterangan
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Tanggal
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {item.kdanak}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {item.kdtunjangan}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {item.bulan}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {item.tahun}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {item.keterangan}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        {new Date(item.tanggal)
                          .toISOString()
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("/")}
                      </td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link
                            href={`/admin/pembayaran/lihat-profesi/${item.kdtunjangan}`}
                          >
                            <MdPayment className="text-[#2552F4] text-lg" />
                          </Link>
                          <TbTrash
                            className="text-[#E20202] text-lg cursor-pointer"
                            onClick={() => handleDelete(item.kdtunjangan)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer"
                >
                  ‹
                </button>

                {/* Single page number button */}
                <span className="w-8 h-8 bg-[#18A3DC] rounded-full flex items-center justify-center text-black cursor-pointer">
                  {currentPage}
                </span>

                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
