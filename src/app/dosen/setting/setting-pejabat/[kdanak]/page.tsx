"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import { GrAddCircle } from "react-icons/gr"
import { TbTrash } from "react-icons/tb"
import { FiEdit } from "react-icons/fi"
import PejabatModal from "@/components/Pejabat"
import useAxios from "../../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter, useParams } from "next/navigation"
import Swal from "sweetalert2"

interface Pejabat {
  kdanak: string
  nik: string
  nip: string
  nmpeg: string
  kdjab: string
  nmjab: string
  kdduduk: string
  jurubayar: string
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editData, setEditData] = useState<Pejabat | undefined>()
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([])

  const [filteredData, setFilteredData] = useState<Pejabat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [namalengkap, setNamalengkap] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [isClient, setIsClient] = useState(false)
  const params = useParams()
  const kdanak = params.kdanak ?? ""
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  console.log("params:", params)
  console.log("kdanak:", kdanak)

  const apiUrl = "http://localhost:8080"

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      router.push("/")
      return
    }

    try {
      const decoded = jwtDecode<{ exp: number; namalengkap: string }>(accessToken)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decoded.exp < currentTime) {
        localStorage.removeItem("accessToken")
        router.push("/")
      } else {
        setToken(accessToken)
      }
    } catch (err) {
      console.error("Error decoding token:", err)
      router.push("/")
    }
  }, [isClient])

  useEffect(() => {
    if (!token) return

    const getPejabat = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/ruhpejabat`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const filteredData = response.data.Data[0]?.filter((item: Pejabat) => item.kdanak === kdanak) || []

        setPejabatList(filteredData)
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data PEJABAT")
      } finally {
        setLoading(false)
      }
    }

    getPejabat()
  }, [token, axiosInstance, kdanak])

  useEffect(() => {
    if (!pejabatList.length) return

    const filtered = pejabatList.filter(
      (item) => item.nip.includes(searchTerm) || item.nmpeg.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, pejabatList])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const totalItems = pejabatList.filter(
    (item) => item.nip.includes(searchTerm) || item.nmpeg.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleAdd = () => {
    setModalMode("add")
    setEditData(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (data: Pejabat) => {
    setModalMode("edit")
    setEditData(data)
    setIsModalOpen(true)
  }

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
          })

          setPejabatList(pejabatList.filter((item) => item.nip !== nip))

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success")
        } catch (error) {
          console.error("Error deleting data:", error)
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
        }
      }
    })
  }

  const handleSave = (data: Pejabat) => {
    if (modalMode === "add") {
      setPejabatList([...pejabatList, data])
    } else {
      setPejabatList(pejabatList.map((item) => (item.nip === editData?.nip ? { ...data } : item)))
    }
    setIsModalOpen(false)
  }

  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">SETTING PEJABAT</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
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

          <div className="flex space-x-2 w-full md:w-auto">
            <button onClick={handleAdd} className="flex flex-col items-center cursor-pointer hover:opacity-80">
              <GrAddCircle className="text-2xl" />
              <span className="text-black text-xs">Tambah</span>
            </button>
            <input
              type="text"
              placeholder="Cari NIP atau Nama Pejabat"
              className="border rounded py-2 px-4 focus:outline-none focus:ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 mb-2 w-full border-t border-gray-300" />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse border-gray-300 border responsive-table">
            <thead className="border">
              <tr className="border">
                <th className="border border-gray-300 px-6 py-4 text-center">Kode Anak</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Nama Pejabat</th>
                <th className="border border-gray-300 px-6 py-4 text-center">NIP</th>
                <th className="border border-gray-300 px-6 py-4 text-center">NIK</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Kode Kedudukan</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Jabatan</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="kdanak">
                      {item.kdanak}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="nmpeg">
                      {item.nmpeg}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="nip">
                      {item.nip}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="nik">
                      {item.nik}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="kdduduk">
                      {item.kdduduk}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="nmjab">
                      {item.nmjab}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Aksi">
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-[#FFBD59] text-white rounded-md">
            Kembali
          </button>
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
  )
}
