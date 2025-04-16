"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Sidebar from "@/components/sidebar"
import useAxios from "../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Link from "next/link"

const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
})

interface TanggalTunjangan {
  kdanak: string
  kdtunjangan: string
  bulan: string
  tahun: string
  keterangan: string
  tanggal: string
}

export default function Page() {
  const [tanggalTunjangan, setTanggalTunjangan] = useState<TanggalTunjangan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<TanggalTunjangan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
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
          const decoded = jwtDecode(accessToken)
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

    const fetchData = async () => {
      setLoading(true)
      try {
        const [profesiRes, kehormatanRes] = await Promise.all([
          axiosInstance.get(`${apiUrl}/tanggalprofesi`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get(`${apiUrl}/tanggalkehormatan`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const profesiData = profesiRes.data.Data || []
        const kehormatanData = kehormatanRes.data.Data || []

        // Pastikan Data adalah array sebelum digabungkan
        const combinedData = [...kehormatanData, ...profesiData].flat()
        console.log("Combined Data:", combinedData)

        setTanggalTunjangan(combinedData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Gagal mengambil data.")
        localStorage.removeItem("accessToken")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, axiosInstance])

  useEffect(() => {
    if (!tanggalTunjangan.length) return

    const filtered = tanggalTunjangan.filter((item) => {
      // Format the date for searching
      const formattedDate = new Date(item.tanggal).toISOString().split("T")[0].split("-").reverse().join("/")

      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        item.kdanak.toLowerCase().includes(searchLower) ||
        item.kdtunjangan.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) ||
        item.bulan.toString().includes(searchLower) ||
        item.tahun.toString().includes(searchLower) ||
        item.keterangan.toLowerCase().includes(searchLower)

      const tahun = Number(item.tahun)
      const matchesYear = selectedYear === null || selectedYear === 0 || tahun === selectedYear

      return matchesSearch && matchesYear
    })

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    setFilteredData(filtered.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage))

    // Update entries state to match itemsPerPage
    setItemsPerPage(entries)
  }, [searchTerm, entries, tanggalTunjangan, selectedYear, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages =
    Math.ceil(
      tanggalTunjangan.filter((item) => {
        // Format the date for searching
        const formattedDate = new Date(item.tanggal).toISOString().split("T")[0].split("-").reverse().join("/")

        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          searchTerm === "" ||
          item.kdanak.toLowerCase().includes(searchLower) ||
          item.kdtunjangan.toLowerCase().includes(searchLower) ||
          formattedDate.includes(searchLower) ||
          item.bulan.toString().includes(searchLower) ||
          item.tahun.toString().includes(searchLower) ||
          item.keterangan.toLowerCase().includes(searchLower)

        const tahun = Number(item.tahun)
        const matchesYear = selectedYear === null || selectedYear === 0 || tahun === selectedYear

        return matchesSearch && matchesYear
      }).length / itemsPerPage,
    ) || 1

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">EXPORT FILE</h2>
            </div>

            <div className="flex justify-between items-center mb-4 mt-8">
              <div className="flex items-center space-x-4">
                <label htmlFor="entries" className="mr-2">
                  Tahun
                </label>
                <select
                  id="tahun"
                  className="border rounded p-2 w-32"
                  value={selectedYear ?? "-"}
                  onChange={(e) => setSelectedYear(e.target.value === "-" ? null : Number(e.target.value))}
                >
                  <option value="-">-</option>
                  {Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => (
                    <option key={i} value={2015 + i}>
                      {2015 + i}
                    </option>
                  ))}
                </select>
              </div>
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
                  onChange={(e) => setEntries(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cari"
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 mb-2 w-full border-t border-gray-300" />
            <table className="min-w-full bg-white border-collapse border-gray-300border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Anak</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Kode Tunjangan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Tanggal Gaji</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Bulan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Tahun</th>
                  <th className="border border-gray-300 px-6 py-4 text-center">Keterangan</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdanak}</td>
                      <td className="px-6 border border-gray-300 py-4 text-center">{item.kdtunjangan}</td>
                      <td className="px-6 border border-gray-300py-4 text-center">
                        {new Date(item.tanggal).toISOString().split("T")[0].split("-").reverse().join("/")}
                      </td>
                      <td className="px-6 border border-gray-300py-4 text-center">{item.bulan}</td>
                      <td className="px-6 border border-gray-300py-4 text-center">{item.tahun}</td>
                      <td className="px-6 border border-gray-300py-4 text-center">{item.keterangan}</td>
                      <td className="px-4 border border-gray-300 py-2 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex space-x-2">
                            <button className="w-30 h-10 bg-[#FFBD59] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer">
                              <Link
                                href={`/pdf-lampiran/${item.kdtunjangan}`}
                                className="w-full h-full flex items-center justify-center"
                              >
                                Lampiran
                              </Link>
                            </button>
                            <button className="w-30 h-10 bg-[#5575E7] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer">
                              <Link
                                href={`/pdf-adk/${item.kdtunjangan}`}
                                className="w-full h-full flex items-center justify-center"
                              >
                                ADK
                              </Link>
                            </button>
                            <button className="w-30 h-10 bg-[#E85FB9] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer">
                              <Link
                                href={`/pdf-spm/${item.kdtunjangan}`}
                                className="w-full h-full flex items-center justify-center"
                              >
                                SPM
                              </Link>
                            </button>
                          </div>

                          {/* Baris kedua: Lampiran, SSP, SPTJM */}
                          <div className="flex space-x-2">
                            <button className="w-30 h-10 bg-[#7C93C3] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer">
                              <Link
                                href={`/pdf-sptjm/${item.kdtunjangan}`}
                                className="w-full h-full flex items-center justify-center"
                              >
                                SPTJM
                              </Link>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Tidak ada data yang tersedia
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
        </section>
      </div>
    </div>
  )
}
