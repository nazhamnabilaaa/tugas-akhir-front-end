"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import useAxios from "../../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface AnakSatker {
  kdsatker: string
  kdanak: string
  nmanak: string
  modul: string
}

export default function Page() {
  const [anakSatkerList, setAnakSatkerList] = useState<AnakSatker[]>([])
  const [filteredData, setFilteredData] = useState<AnakSatker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const axiosInstance = useAxios()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [isClient, setIsClient] = useState(false)
  const params = useParams()
  const kdsatker = params.kdsatker ?? ""
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
      const decoded = jwtDecode<{ exp: number }>(accessToken)
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
  }, [isClient, router])

  useEffect(() => {
    if (!token) return

    const getAnakSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/cabangsatker`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const filteredData = response.data.Data[0]?.filter((item: AnakSatker) => item.kdsatker === kdsatker) || []
        setAnakSatkerList(filteredData)
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
  }, [token, axiosInstance, kdsatker, router])

  useEffect(() => {
    if (!anakSatkerList.length) return

    const filtered = anakSatkerList.filter(
      (item) => item.kdanak.includes(searchTerm) || item.nmanak.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, anakSatkerList])

  if (!isClient) return null
  if (loading) return <div className="text-center p-10">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>

  const totalItems = anakSatkerList.filter(
    (item) => item.kdanak.includes(searchTerm) || item.nmanak.toLowerCase().includes(searchTerm.toLowerCase()),
  ).length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">REFERENSI ANAK SATKER</h2>
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
                setCurrentPage(1)
              }}
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
              placeholder="Cari berdasarkan kode atau nama Anak"
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
                <th className="border border-gray-300 px-6 py-4 text-center">Nama Anak</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Modul</th>
                <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Kode Satker">
                      {item.kdanak}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Nama Satker">
                      {item.nmanak}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Alamat">
                      {item.modul}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center" data-label="Aksi">
                      <div className="flex justify-center space-x-2">
                        <Link
                          href={`/dosen/setting/setting-pejabat/${item.kdanak}`}
                          className="bg-[#004AAD] text-white px-8 py-2 rounded-xl hover:bg-gray-400 focus:outline-none"
                        >
                          RUH Pejabat
                        </Link>
                        <Link
                          href={`/dosen/data-dosen/restore/${item.kdanak}`}
                          className="bg-[#004AAD] text-white px-8 py-2 rounded-xl hover:bg-gray-400 focus:outline-none"
                        >
                          Pegawai
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">
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
    </section>
  )
}
