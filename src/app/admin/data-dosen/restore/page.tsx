"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GrAddCircle } from "react-icons/gr";
import { TbTrash } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";
import { Dialog } from "@/components/ui/dialog";
import { FaRegFileAlt } from "react-icons/fa";
import routes from "@/routes";
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
});

interface RestoreData {
  KodeUpload: string;
  bulan: string;
  tahun: string;
  file: string | null;
  kdanak: string;
}

import Sidebar from "@/components/sidebar";

export default function Page() {
  const [restoreDataList, setRestoreDataList] = useState<RestoreData[]>([]);
  const [filteredData, setFilteredData] = useState<RestoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxios();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const kdanak = params.kdanak ?? "";
  const [currentPage, setCurrentPage] = useState(1);

  const apiUrl = "http://localhost:8080";

  const totalPages = Math.ceil(
    restoreDataList.filter((item) =>
      item.tahun.toString().includes(searchTerm)
    ).length / entries
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditClick = (nip: string) => {
    router.push(`/admin/data-dosen/edit-pegawai?nip=${nip}`);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        localStorage.removeItem("accessToken");
        router.push("/");
      } else {
        setToken(accessToken);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      router.push("/");
    }
  }, [isClient]);

  useEffect(() => {
    if (!token) return;

    const getRestore = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/upload-excel`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRestoreDataList(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data Restore");
      } finally {
        setLoading(false);
      }
    };

    getRestore();
  }, [token, axiosInstance]);

  useEffect(() => {
    const start = (currentPage - 1) * entries;
    const end = start + entries;

    const filtered = restoreDataList.filter((item) =>
      item.tahun.toString().includes(searchTerm)
    );

    setFilteredData(filtered.slice(start, end));
  }, [searchTerm, entries, currentPage, restoreDataList]);

  if (!isClient) return null;

  const handleDelete = async (KodeUpload: string) => {
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
          await axiosInstance.delete(`${apiUrl}/upload-excel/${KodeUpload}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setRestoreDataList(
            restoreDataList.filter((item) => item.KodeUpload !== KodeUpload)
          );

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success");
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  return (
    <div className="flex flex-col">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">LIST FILE DATA PEGAWAI</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="periode" className="mr-2">Periode</label>
                <select
                  id="periode"
                  className="border rounded p-2 w-32"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                >
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="ml-2">Entri</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="entries" className="mr-2">Tampilan</label>
                <select
                  id="entries"
                  className="border rounded p-2 w-32"
                  value={entries}
                  onChange={(e) => setEntries(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ml-2">Entri</span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cari Kode Upload"
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 mb-2 w-full border-t border-gray-300" />
            <table className="min-w-full bg-white border-collapse border-gray-300 border responsive-table">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Anak</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Upload</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Bulan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Tahun</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdanak}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.KodeUpload}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.bulan}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.tahun}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          {item.file && (
                            <a href={item.file} download className="text-green-600">
                              <FaRegFileAlt className="cursor-pointer text-xl" />
                            </a>
                          )}
                          <FiEdit className="text-[#2552F4] cursor-pointer" onClick={() => handleEditClick("1987654321")} />
                          <TbTrash className="text-[#E20202] text-lg cursor-pointer" onClick={() => handleDelete(item.KodeUpload)} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">Tidak ada data</td>
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
           {/*} <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-[#FFBD59] text-white rounded-md"
              >
                Kembali
              </button>
            </div>*/}
          </div>
        </section>
      </div>
    </div>
  );
}
