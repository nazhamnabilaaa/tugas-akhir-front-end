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
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")

  const apiUrl = "http://localhost:8080"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        router.push("/")
      } else {
        try {
          const decoded = jwtDecode<{ exp: number }>(accessToken)
          const currentTime = Math.floor(Date.now() / 1000)

          if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired")
            localStorage.removeItem("accessToken") // Hapus token expired
            router.push("/") // Redirect ke login
          } else {
            setToken(accessToken)
          }
        } catch (err) {
          console.error("Error decoding token:", err)
          router.push("/")
        }
      }
    }
  }, [router]) // Menambahkan router ke dalam dependensi

  useEffect(() => {
    if (!token) return

    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/satkeruniv`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setKonfigurasi(response.data.Data[0] || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
      }
    }

    getSatker()
  }, [token, axiosInstance, router]) // Menambahkan router ke dalam dependensi

  const handleSave = async (data: KonfigurasiSatker) => {
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
      setKonfigurasi((prevKonfigurasi) =>
        prevKonfigurasi.map((item) => (item.kdsatker === selectedKonfigurasi.kdsatker ? data : item)),
      )

      Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success")
    } else {
      const isDuplicate = konfigurasi.some((item) => item.kdsatker === data.kdsatker)

      if (isDuplicate) {
        Swal.fire("Error!", "Data dengan kode satker ini sudah ada!", "error")
        return
      }

      setKonfigurasi((prevKonfigurasi) => [
        ...prevKonfigurasi,
        { ...data },
      ])

      Swal.fire("Berhasil!", "Data baru berhasil ditambahkan.", "success")
    }

    setIsModalOpen(false)
    setSelectedKonfigurasi(null)
  }

  const handleEdit = (item: KonfigurasiSatker) => {
    setSelectedKonfigurasi(item)
    setIsModalOpen(true)
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

      await axiosInstance.delete(`${apiUrl}/satkeruniv/${kdsatker}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire("Berhasil!", "Data berhasil dihapus.", "success")

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

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, konfigurasi])

  const totalItems = konfigurasi.filter(
    (item) => item.kdsatker.includes(searchTerm) || item.nmsatker.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex flex-col">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
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
                {filteredData.map((satker) => (
                  <tr key={satker.kdsatker} className="border">
                    <td className="border border-gray-300 px-6 py-4 text-center">{satker.kdsatker}</td>
                    <td className="border border-gray-300 px-6 py-4 text-center">{satker.nmsatker}</td>
                    <td className="border border-gray-300 px-6 py-4 text-center">{satker.alamat}</td>
                    <td className="border border-gray-300 px-6 py-4 text-center">{satker.kota}</td>
                    <td className="border border-gray-300 px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(satker)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(satker.kdsatker)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <TbTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span>
                  {`Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems} entri`}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="bg-gray-200 px-4 py-2 rounded-md"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="bg-gray-200 px-4 py-2 rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <AddKonfigurasiSatkerModal
          onSave={handleSave}
          selectedKonfigurasi={selectedKonfigurasi}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
