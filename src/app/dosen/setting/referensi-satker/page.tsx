"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import useAxios from "../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSatker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<KonfigurasiSatker[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [namalengkap, setNamalengkap] = useState("")
  const [isClient, setIsClient] = useState(false)

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

  if (!isClient) return null

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const totalItems = konfigurasi.filter(
    (item) => item.kdsatker.includes(searchTerm) || item.nmsatker.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">REFERENSI SATKER</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="mr-2">
              Tampilan
            </label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1) // Reset to first page when changing items per page
              }}
              className="border rounded p-2 w-32"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2">Entri</span>
          </div>

          <div className="flex space-x-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari berdasarkan kode atau nama satker"
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
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Kode Satker">
                      {item.kdsatker}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Nama Satker">
                      {item.nmsatker}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Alamat">
                      {item.alamat}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Kota">
                      {item.kota}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Aksi">
                      <div className="flex justify-center space-x-2">
                        <Link
                          href={`/dosen/setting/referensi-anak-satker/${item.kdsatker}`}
                          className="bg-[#004AAD] text-white px-8 py-2 rounded-xl hover:bg-gray-400 focus:outline-none"
                        >
                          Default
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <td colSpan={4} className="text-center py-4">
                  Tidak ada data
                </td>
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
      </div>
    </section>
  )
}
