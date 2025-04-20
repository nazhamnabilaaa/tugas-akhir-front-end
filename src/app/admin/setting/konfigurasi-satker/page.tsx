"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { GrAddCircle } from "react-icons/gr"
import { TbTrash } from "react-icons/tb"
import { FiEdit } from "react-icons/fi"
import AddKonfigurasiSatkerModal from "@/components/Satker"
import AdminNavbar from "@/components/navbar/AdminNavbar"
import useAxios from "../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

interface KonfigurasiSatker {
  kdsatker: string
  nmsatker: string
  kdkppn: string
  nmkppn: string
  email: string
  notelp: string
  npwp: string
  nmppk: string
  kota: string
  provinsi: string
  alamat: string
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedKonfigurasi, setSelectedKonfigurasi] = useState<KonfigurasiSatker | null>(null)
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSatker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<KonfigurasiSatker[]>([])
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

    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/satkeruniv`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Ambil hanya data yang bisa di-map
        setKonfigurasi(response.data.Data[0] || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Satuan Kerja Universitas")
      } finally {
        setLoading(false)
      }
    }

    getSatker()
  }, [token, axiosInstance])

  const handleSave = async (data: any) => {
    const result = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin memperbarui Data Satuan Kerja ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return // Jika batal, hentikan proses

    if (selectedKonfigurasi) {
      // Edit data yang sudah ada
      setKonfigurasi((prevKonfigurasi) =>
        prevKonfigurasi.map((item) => (item.kdsatker === selectedKonfigurasi.kdsatker ? data : item)),
      )

      Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success")
    } else {
      // Cek apakah `kdsatker` sudah ada
      const isDuplicate = konfigurasi.some((item) => item.kdsatker === data.kdsatker)

      if (isDuplicate) {
        Swal.fire("Error!", "Data dengan kode satker ini sudah ada!", "error")
        return
      }

      // Tambah data baru
      setKonfigurasi((prevKonfigurasi) => [
        ...prevKonfigurasi,
        {
          kdsatker: data.kdsatker,
          nmsatker: data.nmsatker,
          kdkppn: data.kdkppn,
          nmkppn: data.nmkppn,
          email: data.email,
          notelp: data.notelp,
          npwp: data.npwp,
          nmppk: data.nmppk,
          kota: data.kota,
          provinsi: data.provinsi,
          alamat: data.alamat,
        },
      ])

      Swal.fire("Berhasil!", "Data baru berhasil ditambahkan.", "success")
    }

    setIsModalOpen(false)
    setSelectedKonfigurasi(null)
  }

  const handleEdit = (item: KonfigurasiSatker) => {
    setSelectedKonfigurasi(item)
    setIsModalOpen(true) // Menampilkan modal edit
  }

  const handleDelete = async (kdsatker: string) => {
    try {
      const result = await Swal.fire({
        title: `Hapus Kode ${kdsatker}?`,
        text: "Apakah Anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      })

      if (!result.isConfirmed) return

      // Mengirim permintaan DELETE ke API
      await axiosInstance.delete(`${apiUrl}/satkeruniv/${kdsatker}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire("Berhasil!", "Data berhasil dihapus.", "success")

      // Perbarui state untuk menghapus data dari daftar
      setKonfigurasi((prevKonfigurasi) => prevKonfigurasi.filter((item) => item.kdsatker !== kdsatker))
    } catch (error) {
      console.error("Error deleting data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat menghapus data.", "error")
    }
  }

  useEffect(() => {
    if (!konfigurasi.length) return

    const filtered = konfigurasi.filter(
      (item) => item.kdsatker.includes(searchTerm) || item.nmsatker.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, konfigurasi])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const totalItems = konfigurasi.filter(
    (item) => item.kdsatker.includes(searchTerm) || item.nmsatker.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">KONFIGURASI SATKER</h2>
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
                <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center cursor-pointer">
                  <GrAddCircle className="text-2xl" />
                  <span className="text-black text-xs">Tambah</span>
                </button>
                <input
                  type="text"
                  placeholder="Cari Kode Satker atau Nama Satker"
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
                  <th className="border border-gray-300 px-6 py-4 text-center">Nama Satker</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Alamat</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Kota</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdsatker}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.nmsatker}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.alamat}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kota}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <FiEdit
                            className="text-[#2552F4] text-lg cursor-pointer"
                            onClick={() => handleEdit(item)} // Edit data
                          />
                          <TbTrash
                            className="text-[#E20202] text-lg cursor-pointer"
                            onClick={() => handleDelete(item.kdsatker)} // Hapus data
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

          {/* Modal untuk menambah atau mengedit data */}
          <AddKonfigurasiSatkerModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedKonfigurasi(null) // Reset data yang sedang diedit
            }}
            onSave={handleSave}
            initialData={selectedKonfigurasi} // Kirim data yang dipilih untuk diedit
          />
        </section>
      </div>
    </div>
  )
}
