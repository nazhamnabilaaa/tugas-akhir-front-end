"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import { GrAddCircle } from "react-icons/gr"
import { TbTrash } from "react-icons/tb"
import { FaRegFileAlt } from "react-icons/fa"
import { FiEdit } from "react-icons/fi"
import useAxios from "../../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter, useParams } from "next/navigation"
import Swal from "sweetalert2"
import Link from "next/link"

interface RestoreData {
  KodeUpload: string
  bulan: string
  tahun: string
  file: string | null
  kdanak: string
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [restoreDataList, setRestoreDataList] = useState<RestoreData[]>([])
  const [filteredData, setFilteredData] = useState<RestoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [isClient, setIsClient] = useState(false)
  const params = useParams()
  const kdanak = params.kdanak ?? ""
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    KodeUpload: "",
    bulan: "",
    tahun: new Date().getFullYear().toString(),
    kdanak: kdanak,
    file: null as File | null,
  })

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

    const getRestore = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/upload-excel`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const filteredData = response.data.Data[0]?.filter((item: RestoreData) => item.kdanak === kdanak) || []

        setRestoreDataList(filteredData)
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Satuan Kerja Fakultas")
      } finally {
        setLoading(false)
      }
    }

    getRestore()
  }, [token, axiosInstance, kdanak])

  useEffect(() => {
    if (!restoreDataList.length) return

    const filtered = restoreDataList.filter(
      (item) =>
        item.KodeUpload.toString().includes(searchTerm) ||
        item.tahun.toString().includes(searchTerm)
    )

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, restoreDataList])

  if (!isClient) return null

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const totalItems = restoreDataList.filter((item) => item.KodeUpload.toString().includes(searchTerm)).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleEditClick = (nip: string) => {
    router.push(`/dosen/data-dosen/edit-pegawai`)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const confirmation = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin menyimpan data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (!confirmation.isConfirmed) return

    if (!formData.bulan || !formData.tahun || !formData.file) {
      Swal.fire("Error", "Harap lengkapi semua form dan pilih file!", "error")
      return
    }

    try {
      const data = new FormData()
      data.append("KodeUpload", formData.KodeUpload || "") // Pastikan tidak undefined
      data.append("kdanak", kdanak || "") // Gunakan `params.kdanak` langsung
      data.append("bulan", formData.bulan || "") // Pastikan tidak undefined
      data.append("tahun", formData.tahun || new Date().getFullYear().toString())
      if (formData.file) {
        data.append("file", formData.file)
      }

      const response = await axiosInstance.post(`${apiUrl}/upload-excel`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      const message = response.data.msg

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Berhasil!", message, "success")
        window.location.reload()
      } else {
        Swal.fire("Gagal!", message, "error")
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data!", "error")
    }
    setIsModalOpen(false)
  }

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
          })

          setRestoreDataList(restoreDataList.filter((item) => item.KodeUpload !== KodeUpload))

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success")
        } catch (error) {
          console.error("Error deleting data:", error)
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
        }
      }
    })
  }

  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">RESTORE DATA DOSEN</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="periode" className="mr-2">
              Periode
            </label>
            <select id="periode" className="border rounded p-2 w-32" onChange={(e) => setSearchTerm(e.target.value)}>
              {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
            <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center cursor-pointer">
              <GrAddCircle className="text-2xl" />
              <span className="text-black text-xs">Tambah</span>
            </button>
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
        <div className="overflow-x-auto">
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
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Kode Anak">
                      {item.kdanak}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Kode Upload">
                      {item.KodeUpload}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Bulan">
                      {item.bulan}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Tahun">
                      {item.tahun}
                    </td>

                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Aksi">
                      <div className="flex justify-center space-x-2">
                        {item.file && (
                          <a href={item.file} download className="text-green-600">
                            <FaRegFileAlt className="cursor-pointer text-xl" />
                          </a>
                        )}
                        <Link href="/dosen/data-dosen/edit-pegawai">
                          <FiEdit className="text-[#2552F4] cursor-pointer" />
                        </Link>
                        <TbTrash
                          className="text-[#E20202] text-lg cursor-pointer"
                          onClick={() => handleDelete(item.KodeUpload)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[650px] mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">UPLOAD DATA PEGAWAI</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="block">Kode Anak</label>
                <input
                  type="text"
                  value={formData.kdanak}
                  onChange={(e) => setFormData({ ...formData, kdanak: e.target.value })}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block">Kode Upload</label>
                <input
                  type="text"
                  value={formData.KodeUpload}
                  onChange={(e) => setFormData({ ...formData, KodeUpload: e.target.value })}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block">Bulan</label>
                <input
                  type="text"
                  value={formData.bulan}
                  onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block">Tahun</label>
                <select
                  className="border rounded-lg p-2 w-100 bg-gray-100"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                  required
                >
                  <option value="">Pilih Tahun</option>
                  {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => (
                    <option key={i} value={2020 + i}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block">Upload File</label>
                <input
                  type="text"
                  value={formData.file ? formData.file.name : "No File Selected"}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  readOnly
                />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData((prevData) => ({
                        ...prevData,
                        file: file,
                      }))
                    }
                  }}
                  id="fileUpload"
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                >
                  Choose File
                </button>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#FFBD59] text-white rounded-md"
                >
                  Kembali
                </button>
                <button type="submit" className="px-4 py-2 bg-[#18439D] text-white rounded-md">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
