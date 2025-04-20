"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { GrAddCircle } from "react-icons/gr";
import { TbTrash } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";
import PejabatModal from "@/components/Pejabat";
import AdminNavbar from "@/components/navbar/AdminNavbar";
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Pejabat {
  kdanak: string;
  nip: string;
  nik: string;
  nmpeg: string;
  nmjab: string;
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<Pejabat | undefined>();
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([]);
  const [filteredData, setFilteredData] = useState<Pejabat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
            localStorage.removeItem("accessToken");
            router.push("/");
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

    const getRUHPejabat = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/ruhpejabat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPejabatList(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching RUH PEJABAT:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data R/U/H Pejabat");
      } finally {
        setLoading(false);
      }
    };

    getRUHPejabat();
  }, [token, axiosInstance]);

  useEffect(() => {
    const filtered = pejabatList.filter(
      (item) =>
        item.nip.includes(searchTerm) ||
        item.nmpeg.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPage = Math.ceil(filtered.length / entries);
    setTotalPages(totalPage);
    const startIndex = (currentPage - 1) * entries;
    const endIndex = startIndex + entries;
    setFilteredData(filtered.slice(startIndex, endIndex));
  }, [searchTerm, entries, pejabatList, currentPage]);

  const handleAdd = () => {
    setModalMode("add");
    setEditData(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (data: Pejabat) => {
    setModalMode("edit");
    setEditData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (nip: string) => {
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
          await axiosInstance.delete(`${apiUrl}/ruhpejabat/${nip}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedList = pejabatList.filter((item) => item.nip !== nip);
          setPejabatList(updatedList);
          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success");
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  const handleSave = (data: Pejabat) => {
    if (modalMode === "add") {
      setPejabatList([...pejabatList, data]);
    } else {
      setPejabatList(
        pejabatList.map((item) =>
          item.nip === editData?.nip ? { ...data } : item
        )
      );
    }
    setIsModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col">
      <AdminNavbar />

      <div className="flex">
        <Sidebar />
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">SETTING PEJABAT</h2>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="entries" className="mr-2">Tampilan</label>
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
                <button
                  onClick={handleAdd}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80"
                >
                  <GrAddCircle className="text-2xl" />
                  <span className="text-black text-xs">Tambah</span>
                </button>
                <input
                  type="text"
                  placeholder="Cari NIP atau Nama Pejabat"
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
            <table className="min-w-full bg-white border-collapse border-gray-300 border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Anak</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">NIP</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">NIK</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Nama Pejabat</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Jabatan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.kdanak}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nip}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nik}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nmpeg}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nmjab}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <FiEdit
                          className="text-[#2552F4] text-lg cursor-pointer hover:opacity-80"
                          onClick={() => handleEdit(item)}
                        />
                        <TbTrash
                          className="text-[#E20202] text-lg cursor-pointer hover:opacity-80"
                          onClick={() => handleDelete(item.nip)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
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

          <PejabatModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            editData={editData}
            mode={modalMode}
          />
        </section>
      </div>
    </div>
  );
}
