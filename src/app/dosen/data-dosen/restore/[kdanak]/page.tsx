"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar/navbar"
import { TbTrash } from "react-icons/tb"
import { FaRegFileAlt } from "react-icons/fa"
import useAxios from "../../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter, useParams } from "next/navigation"
import Swal from "sweetalert2"

interface RestoreData {
  KodeUpload: string
  bulan: string
  tahun: string
  file: string | null
  kdanak: string
}

export default function Page() {
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
  const [currentPage] = useState(1)
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
  }, [isClient, router])

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

    const filtered = restoreDataList.filter((item) => item.KodeUpload.toString().includes(searchTerm))

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setFilteredData(filtered.slice(startIndex, endIndex))
  }, [searchTerm, currentPage, itemsPerPage, restoreDataList])

  if (!isClient) return null

  // const totalItems = restoreDataList.filter((item) => item.KodeUpload.toString().includes(searchTerm)).length

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
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
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
              }}
            >
              {[10, 20, 30, 40].map((entryCount) => (
                <option key={entryCount} value={entryCount}>
                  {entryCount} data
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="table-auto w-full mt-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Kode Upload</th>
              <th className="py-2 px-4">Bulan</th>
              <th className="py-2 px-4">Tahun</th>
              <th className="py-2 px-4">File</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-2">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-2 text-red-500">
                  {error}
                </td>
              </tr>
            ) : (
              filteredData.map((data) => (
                <tr key={data.KodeUpload}>
                  <td className="py-2 px-4">{data.KodeUpload}</td>
                  <td className="py-2 px-4">{data.bulan}</td>
                  <td className="py-2 px-4">{data.tahun}</td>
                  <td className="py-2 px-4">{data.file ? <FaRegFileAlt /> : "No file"}</td>
                  <td className="py-2 px-4">
                    <button
                      className="text-yellow-500"
                      onClick={() => handleDelete(data.KodeUpload)}
                    >
                      <TbTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
