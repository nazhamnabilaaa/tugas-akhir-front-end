"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import Link from "next/link"
import useAxios from "../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"

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
  const [displayedData, setDisplayedData] = useState<TanggalTunjangan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState(10)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
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
            localStorage.removeItem("accessToken")
            router.push("/")
          } else {
            setToken(accessToken)
          }
        } catch (err) {
          console.error("Error decoding token:", err)
          router.push("/")
        }
      }
    }
  }, [router]) // Add router to the dependency array

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
      const formattedDate = new Date(item.tanggal).toISOString().split("T")[0].split("-").reverse().join("/")

      const matchesSearch =
        searchTerm === "" ||
        item.kdanak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kdtunjangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedDate.includes(searchTerm.toLowerCase()) ||
        item.bulan.toString().includes(searchTerm.toLowerCase()) ||
        item.tahun.toString().includes(searchTerm.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase())

      const tahun = Number(item.tahun)
      const matchesYear = selectedYear === null || selectedYear === 0 || tahun === selectedYear

      return matchesSearch && matchesYear
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, tanggalTunjangan, selectedYear])

  useEffect(() => {
    if (!filteredData.length) return

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length)

    setDisplayedData(filteredData.slice(startIndex, endIndex))
  }, [currentPage, itemsPerPage, filteredData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1

  return (
    <section className="text-black px-4 sm:px-8 md:px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">EXPORT FILE</h2>
        </div>

        {/* Periode Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 mt-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <label htmlFor="year" className="mr-2 whitespace-nowrap">
              Tahun
            </label>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
        </div>

        {/* Entries and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label htmlFor="entries" className="whitespace-nowrap">
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
          </div>

          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari"
              className="border rounded py-2 px-4 w-full focus:outline-none focus:ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 mb-2 w-full border-t border-gray-300" />

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Kode Anak</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Kode Tunjangan</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Tanggal Gaji</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Bulan</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Tahun</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Keterangan</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.length > 0 ? (
                displayedData.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.kdanak}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.kdtunjangan}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">
                      {new Date(item.tanggal).toISOString().split("T")[0].split("-").reverse().join("/")}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.bulan}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.tahun}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.keterangan}</td>
                    <td className="px-4 border border-gray-300 py-2 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex space-x-2">
                          <button className="w-30 h-10 bg-[#FFBD59] rounded-lg py-2 px-4 flex items-center justify-center text-center text-white text-xs cursor-pointer">
                            <Link href={`/dashboard/export/tunjangan/print/${item.kdanak}`} target="_blank">
                              Print
                            </Link>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    {loading ? "Loading..." : error ? error : "No data found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span>
              Showing {currentPage} of {totalPages}
            </span>
          </div>
          <div>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
