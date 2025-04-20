"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { GrAddCircle } from "react-icons/gr"
import { TbTrash } from "react-icons/tb"
import { FiEdit } from "react-icons/fi"
import AnakSatkerModal from "@/components/AnakSatker"
import AdminNavbar from "@/components/navbar/AdminNavbar"
import useAxios from "../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

interface AnakSatker {
  kdsatker: string
  kdanak: string
  nmanak: string
  kdsubanak: string
  modul: string
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editData, setEditData] = useState<AnakSatker | undefined>()
  const [anakSatkerList, setAnakSatkerList] = useState<AnakSatker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<AnakSatker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [namalengkap, setNamalengkap] = useState("")

  const apiUrl = "http://localhost:8080"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        router.push("/")
      } else {
        try {
          const decoded = jwtDecode<{ exp: number; namalengkap: string }>(accessToken)
          const currentTime = Math.floor(Date.now() / 1000)

          if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired")
            localStorage.removeItem("accessToken") // Hapus token expired
            router.push("/") // Redirect ke login
          } else {
            setToken(accessToken)
            setNamalengkap(decoded.namalengkap)
          }
        } catch (err) {
          console.error("Error decoding token:", err)
          router.push("/")
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return

    const getAnakSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/cabangsatker`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Ambil hanya data yang bisa di-map
        setAnakSatkerList(response.data.Data[0] || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Satuan Kerja Fakultas")
      } finally {
        setLoading(false)
      }
    }

    getAnakSatker()
  }, [token, axiosInstance])

  const handleAdd = () => {
    setModalMode("add")
    setEditData(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (data: AnakSatker) => {
    setModalMode("edit")
    setEditData(data)
    setIsModalOpen(true)
  }

  const handleDelete = async (kdanak: string) => {
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
          await axiosInstance.delete(`${apiUrl}/cabangsatker/${kdanak}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setAnakSatkerList(anakSatkerList.filter((item) => item.kdanak !== kdanak))

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success")
        } catch (error) {
          console.error("Error deleting data:", error)
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
        }
      }
    })
  }

  const handleSave = (data: AnakSatker) => {
    if (modalMode === "add") {
      setAnakSatkerList([...anakSatkerList, { ...data, kdsubanak: "2" }])
    } else {
      setAnakSatkerList(anakSatkerList.map((item) => (item.kdanak === editData?.kdanak ? { ...data } : item)))
    }
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (!anakSatkerList.length) return

    const filtered = anakSatkerList.filter(
      (item) => item.kdanak.includes(searchTerm) || item.nmanak.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, anakSatkerList])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const totalItems = anakSatkerList.filter(
    (item) => item.kdanak.includes(searchTerm) || item.nmanak.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex flex-col">
      <AdminNavbar />

      <div className="flex">
        <Sidebar />

        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">KONFIGURASI ANAK SATKER</h2>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="entries" className="mr-2">
                  Tampilan
                </label>
                <select
                  id="entries"
                  className="border rounded p-2 w-32"
                  value={entries}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setEntries(value)
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ml-2">Entri</span>
              </div>

              <div className="flex space-x-2">
                <button onClick={handleAdd} className="flex flex-col items-center cursor-pointer hover:opacity-80">
                  <GrAddCircle className="text-2xl" />
                  <span className="text-black text-xs">Tambah</span>
                </button>
                <input
                  type="text"
                  placeholder="Cari Kode Anak atau Nama Anak"
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 mb-2 w-full border-t border-gray-300" />
            <table className="min-w-full bg-white border-collapse border-gray-300 border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Satker</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Anak</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Nama Anak</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Jenis</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdsatker}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdanak}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.nmanak}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.modul}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <FiEdit
                            className="text-[#2552F4] text-lg cursor-pointer"
                            onClick={() => handleEdit(item)} // Edit data
                          />
                          <TbTrash
                            className="text-[#E20202] text-lg cursor-pointer"
                            onClick={() => handleDelete(item.kdanak)} // Hapus data
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Tidak ada data ditemukan
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

          <AnakSatkerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            editData={editData}
            mode={modalMode}
          />
        </section>
      </div>
    </div>
  )
}
