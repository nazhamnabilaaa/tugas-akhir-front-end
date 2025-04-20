"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/navbar";
import { useRouter } from "next/navigation";
import { GrAddCircle } from "react-icons/gr";
import EmployeeModal from "@/components/EmployeeModal";
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { TbTrash } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";

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
  KodeUpload: string;
  kdsubanak: string;
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const axiosInstance = useAxios();
  const [token, setToken] = useState("");

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
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, [router]); // Menambahkan `router` ke dalam dependency array

  useEffect(() => {
    if (!token) return;

    const getPegawai = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/pegawai`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmployees(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    getPegawai();
  }, [token, axiosInstance, router]); // Menambahkan `router` ke dalam dependency array

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleSave = (employeeData: Employee) => {
    if (modalMode === "add") {
      setEmployees([...employees, employeeData]);
    } else {
      setEmployees(employees.map((emp) => (emp.nip === employeeData.nip ? employeeData : emp)));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (nip: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data Pegawai ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`${apiUrl}/pegawai/${nip}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setEmployees(employees.filter((item) => item.nip !== nip));

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success").then(() => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  const filteredData = employees.filter((item) =>
    searchTerm ? item.nmpeg.toLowerCase().includes(searchTerm.toLowerCase()) || item.nip.includes(searchTerm) : true
  );

  const totalPages = Math.ceil(filteredData.length / 10) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedData = filteredData.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-4">EDIT DATA DOSEN</h2>
        <div className="flex justify-end space-x-2">
          <button onClick={handleAddClick} className="flex flex-col items-center cursor-pointer hover:opacity-80">
            <GrAddCircle className="text-2xl" />
            <span className="text-black text-xs">Tambah</span>
          </button>
          <input
            type="text"
            placeholder="Cari NIP atau Nama Dosen"
            className="border rounded py-2 px-4 focus:outline-none focus:ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4 mb-2 w-full border-t border-gray-300" />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border px-6 py-4 text-center">Kode Anak</th>
                <th className="border px-6 py-4 text-center">NIP</th>
                <th className="border px-6 py-4 text-center">Nama Dosen</th>
                <th className="border px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((employee) => (
                  <tr key={employee.nip} className="border">
                    <td className="border px-6 py-4 text-center">{employee.kdanak}</td>
                    <td className="border px-6 py-4 text-center">{employee.nip}</td>
                    <td className="border px-6 py-4 text-center">{employee.nmpeg}</td>
                    <td className="border px-6 py-4 text-center">
                      <div className="flex justify-between items-center w-full">
                        <FiEdit className="text-[#2552F4] cursor-pointer" onClick={() => handleEditClick(employee)} />
                        <TbTrash
                          className="text-[#E20202] text-lg cursor-pointer"
                          onClick={() => handleDelete(employee.nip)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border px-6 py-4 text-center">
                    Tidak ada data yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <div className="flex space-x-2">
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer"
              >
                ‹
              </button>

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
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-[#FFBD59] text-white rounded-md"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedEmployee}
        mode={modalMode}
      />
    </section>
  );
}
