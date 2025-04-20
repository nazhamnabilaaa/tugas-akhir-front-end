"use client"

import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Sidebar from "@/components/sidebar"
import { FiEdit } from "react-icons/fi"
import { TbTrash } from "react-icons/tb"
import Link from "next/link"
import useAxios from "../../../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useParams, useRouter } from "next/navigation"
import Swal from "sweetalert2"

const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
})

interface AnakSatkerData {
  kdanak: string
  nmanak: string
  modul: string
  kdsatker: string
}

interface TanggalKehormatan {
  kdanak: string
  kdtunjangan: string
  bulan: string
  tahun: string
  keterangan: string
  tanggal: string
}

interface Employee {
  nmpeg: string
  nip: string
  kdjab: string
  kdkawin: string
  gaji_bersih: string
  nogaji: string
  bulan: string
  tahun: string
  kdgol: string
  kdduduk: string
  npwp: string
  nmrek: string
  nm_bank: string
  rekening: string
  kdbankspan: string
  nmbankspan: string
  kdnegara: string
  kdkppn: string
  kdpos: string
  gjpokok: string
  kdgapok: string
  bpjs: string
  kdanak: string
  kdsubanak: string
}

interface listTunjanganPegawai {
  kdtunjangan: string
  nip: string
  nmpeg: string
  kdgol: string
  gjpokok: string
  nmrek: string
  nm_bank: string
  kdbankspan: string
  rekening: string
  npwp: string
  pajakpph: string
  totalpph: string
  jmlditerima: string
  besartunjangan: string
}

export default function Page() {
  //Tanggal Tunjangan
  const [tanggalkehormatanList, setTanggalkehormatanList] = useState<TanggalKehormatan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const kdtunjangan = params.kdtunjangan ?? ""
  const [formData, setFormData] = useState({
    kdanak: "",
    kdtunjangan: "",
    bulan: "",
    tahun: "",
    keterangan: "",
    tanggal: new Date().getFullYear(),
  })
  const [konfigurasi, setKonfigurasi] = useState<AnakSatkerData[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState([]) // Array for row selection
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [salaryData, setSalaryData] = useState([
    {
      kdtunjangan: "",
      nip: "",
      nmpeg: "",
      kdgol: "",
      gjpokok: "",
      nmrek: "",
      nm_bank: "",
      kdbankspan: "",
      rekening: "",
      npwp: "",
      besartunjangan: "",
      pajakpph: "",
      totalpph: "",
      jmlditerima: "",
    },
  ])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [listTunjangan, setListTunjangan] = useState<listTunjanganPegawai[]>([])
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
    console.log("params:", params) // Debugging params
    console.log("kdtunjangan:", kdtunjangan) // Debugging kdtunjangan

    if (!token || !kdtunjangan) {
      console.warn("Token atau kdtunjangan belum tersedia, menunggu...")
      return
    }

    const GetTanggalKehormatanByKDTunjangan = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(`${apiUrl}/tanggalkehormatan/${kdtunjangan}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data && response.data.Data && response.data.Data.length > 0) {
          const detailData = response.data.Data[0]

          setTanggalkehormatanList(response.data.Data)
          setFormData({
            kdanak: detailData.kdanak || "",
            kdtunjangan: detailData.kdtunjangan || "",
            bulan: detailData.bulan || "",
            tanggal: detailData.tanggal || new Date().getFullYear(),
            tahun: detailData.tahun || "",
            keterangan: detailData.keterangan || "",
          })
        } else {
          console.warn("Data tidak ditemukan.")
          setTanggalkehormatanList([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Gagal mengambil data Tanggal Kehormatan")
      } finally {
        setLoading(false)
      }
    }

    GetTanggalKehormatanByKDTunjangan()
  }, [kdtunjangan, token, axiosInstance])

  useEffect(() => {
    if (!token) return

    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/cabangsatker`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Ambil hanya data yang bisa di-map
        setKonfigurasi(response.data.Data[0] || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Satuan Kerja Fakultas")
      } finally {
        setLoading(false)
      }
    }

    getSatker()
  }, [token, axiosInstance])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update nilai sesuai dengan name input
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const confirmation = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin Meng-update data Tanggal Tunjangan Kehormatan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (!confirmation.isConfirmed) return

    // Pastikan semua field terisi
    if (
      !formData.kdtunjangan ||
      !formData.bulan ||
      !formData.tahun ||
      !formData.keterangan ||
      !formData.tanggal ||
      !formData.kdanak
    ) {
      Swal.fire("Error", "Harap lengkapi semua Form!", "error")
      return
    }

    try {
      const data = {
        kdtunjangan: formData.kdtunjangan,
        bulan: formData.bulan,
        tahun: formData.tahun,
        keterangan: formData.keterangan,
        tanggal: formData.tanggal,
        kdanak: formData.kdanak,
      }

      const response = await axiosInstance.patch(`${apiUrl}/tanggalkehormatan/${formData.kdtunjangan}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 200) {
        Swal.fire("Data berhasil di Update!", "", "success")
        router.push(`/admin/pembayaran/lihat-kehormatan/${formData.kdtunjangan}`)
      } else {
        Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error")
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data!", "error")
    }
  }

  const filteredData = salaryData.filter(
    (item) => item.nmpeg.toLowerCase().includes(searchQuery.toLowerCase()) || item.nip.includes(searchQuery), // NIP tetap angka, tidak perlu toLowerCase()
  )

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    if (!token) return

    const getPegawai = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/pegawai`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Ambil hanya data yang bisa di-map
        const pegawaiData = response.data.Data[0] || []
        setEmployees(pegawaiData)

        setSelectedItems(Array(pegawaiData.length).fill(false))
        setSalaryData(
          pegawaiData.map((pegawai) => ({
            kdtunjangan: kdtunjangan,
            nip: pegawai.nip,
            nmpeg: pegawai.nmpeg,
            kdgol: pegawai.kdgol,
            gjpokok: pegawai.gjpokok,
            nmrek: pegawai.nmrek,
            nm_bank: pegawai.nm_bank,
            kdbankspan: pegawai.kdbankspan,
            rekening: pegawai.rekening,
            npwp: pegawai.npwp,
            besartunjangan: "",
            pajakpph: "",
            totalpph: "",
            jmlditerima: "",
          })),
        )
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Pegawai")
      } finally {
        setLoading(false)
      }
    }
    getPegawai()
  }, [token, axiosInstance, kdtunjangan])

  useEffect(() => {
    if (!token) return

    const getListTunjangan = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/tunjangankehormatan`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = response.data.Data[0] || []

        const filteredData = data.filter((item) => item.kdtunjangan === kdtunjangan)

        setListTunjangan(filteredData)
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken")
        router.push("/")
        setError("Gagal mengambil data Pegawai")
      } finally {
        setLoading(false)
      }
    }
    getListTunjangan()
  }, [token, axiosInstance])

  // Handle individual checkbox change
  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems]
    updatedSelectedItems[index] = !updatedSelectedItems[index]
    setSelectedItems(updatedSelectedItems)
    setSelectAll(updatedSelectedItems.every((item) => item))

    // Jangan kosongkan data pegawai saat checkbox diubah
    const updatedSalaryData = [...salaryData]
    if (updatedSelectedItems[index]) {
      // Jika dicentang, tetap gunakan data pegawai yang sudah ada
      updatedSalaryData[index] = { ...salaryData[index] }
    } else {
      // Jika tidak dicentang, tetap gunakan data pegawai tanpa meresetnya ke kosong
      updatedSalaryData[index] = { ...employees[index], besartunjangan: "", pajakpph: "", totalpph: "", jmlditerima: "" };
    }

    setSalaryData(updatedSalaryData)
  }

  // Handle "Select All" checkbox change
  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setSelectedItems(Array(employees.length).fill(newSelectAll))

    const updatedSalaryData = newSelectAll
      ? employees.map((pegawai) => ({
          kdtunjangan: kdtunjangan, // Sesuai dengan paramsID
          nip: pegawai.nip,
          nmpeg: pegawai.nmpeg,
          kdgol: pegawai.kdgol,
          gjpokok: pegawai.gjpokok,
          nmrek: pegawai.nmrek,
          nm_bank: pegawai.nm_bank,
          kdbankspan: pegawai.kdbankspan,
          rekening: pegawai.rekening,
          npwp: pegawai.npwp,
          besartunjangan: "",
          pajakpph: "",
          totalpph: "",
          jmlditerima: "",
        }))
      : employees.map((pegawai) => ({
          kdtunjangan: kdtunjangan, // Tetap gunakan data pegawai saat uncheck
          nip: pegawai.nip,
          nmpeg: pegawai.nmpeg,
          kdgol: pegawai.kdgol,
          gjpokok: pegawai.gjpokok,
          nmrek: pegawai.nmrek,
          nm_bank: pegawai.nm_bank,
          kdbankspan: pegawai.kdbankspan,
          rekening: pegawai.rekening,
          npwp: pegawai.npwp,
          besartunjangan: "",
          pajakpph: "",
          totalpph: "",
          jmlditerima: "",
        }))

    setSalaryData(updatedSalaryData)
  }

  const handleEditClick = (index) => {
    setEditingRow(index)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingRow(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (editingRow === null || editingRow === undefined) return

    setSalaryData((prevData) => {
      const updatedData = [...prevData]
      updatedData[editingRow] = { ...updatedData[editingRow], [name]: value }
      return updatedData
    })
  }

  const handleEditChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRow === null || editingRow === undefined) {
      Swal.fire("Error", "Tidak ada data yang dipilih untuk diperbarui!", "error")
      return
    }

    const confirmation = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin mengupdate data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (!confirmation.isConfirmed) return

    const pegawai = salaryData[editingRow]

    if (!pegawai.nip) {
      Swal.fire("Error", "NIP pegawai tidak ditemukan!", "error")
      return
    }

    if (!pegawai.kdgol || isNaN(Number(pegawai.kdgol))) {
      Swal.fire("Error", `Kode golongan untuk pegawai ${pegawai.nip} harus diisi dan berupa angka!`, "error")
      return
    }

    if (!pegawai.gjpokok || isNaN(Number(pegawai.gjpokok))) {
      Swal.fire("Error", `Gaji Pokok untuk pegawai ${pegawai.nip} harus diisi dan berupa angka!`, "error")
      return
    }

    try {
      const formattedData = {
        kdtunjangan: kdtunjangan,
        pegawai: [
          {
            nmpeg: pegawai.nmpeg, // Nama pegawai tetap dikirim
            nip: pegawai.nip,
            kdgol: Number(pegawai.kdgol), // Pastikan angka
            gjpokok: Number(pegawai.gjpokok), // Pastikan angka
            nm_bank: pegawai.nm_bank,
            kdbankspan: pegawai.kdbankspan,
            nmrek: pegawai.nmrek,
            rekening: pegawai.rekening,
            npwp: pegawai.npwp,
          },
        ],
      }

      console.log("📌 Data yang dikirim ke backend:", JSON.stringify(formattedData, null, 2))

      const response = await axiosInstance.patch(`${apiUrl}/tunjangankehormatan/${pegawai.nip}`, formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 200 || response.status === 201) {
        Swal.fire(`Data berhasil diperbarui pada nip ${pegawai.nip} !`, "", "success").then(() => {
          window.location.reload()
        })
      } else {
        Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error")
      }
    } catch (error) {
      console.error("❌ Error saat mengupdate data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat mengupdate data!", "error")
    }
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault() // Cegah form auto-submit

    const confirmation = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin menghitung data Tunjangan Kehormatan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (!kdtunjangan) {
      Swal.fire("Error", "Kode Tunjangan tidak ditemukan!", "error")
      return
    }

    if (!confirmation.isConfirmed) return

    // 🔹 Pastikan `kdtunjangan` tidak undefined
    if (!kdtunjangan) {
      Swal.fire("Error", "Kode Tunjangan tidak ditemukan!", "error")
      return
    }

    const selectedSalaryData = salaryData.filter((_, index) => selectedItems[index])

    if (!Array.isArray(selectedSalaryData) || selectedSalaryData.length === 0) {
      Swal.fire("Error", "Data pegawai harus berupa array dan tidak boleh kosong!", "error")
      return
    }

    // 🔹 Pastikan `gjpokok` dalam format number
    const formattedSalaryData = selectedSalaryData.map((item) => ({
      ...item,
      gjpokok: Number(item.gjpokok),
    }))

    // 🔹 Debugging: Periksa data sebelum dikirim
    console.log("Data yang akan dikirim:", JSON.stringify({ kdtunjangan, pegawai: formattedSalaryData }, null, 2))

    try {
      // 🔹 Kirim data dengan `kdtunjangan`
      const response = await axiosInstance.post(
        `${apiUrl}/tunjangankehormatan/`,
        { kdtunjangan, pegawai: formattedSalaryData }, // Tambahkan `kdtunjangan`
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Data berhasil disimpan!", "", "success").then(() => {
          window.location.reload()
        })
      } else {
        Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error")
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data!", "error")
    }
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
          await axiosInstance.delete(`${apiUrl}/tunjangankehormatan/${nip}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setSalaryData(salaryData.filter((item) => item.nip !== nip))

          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success").then(() => {
            window.location.reload()
          })
        } catch (error) {
          console.error("Error deleting data:", error)
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
        }
      }
    })
  }

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex w-full">
        {/* Sidebar */}
        <Sidebar />
        <section className="text-black px-16 flex-grow">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">LIHAT TUNJANGAN KEHORMATAN</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mt-8">
              <div className="grid grid-cols-1 gap-6 mt-8">
                {/* Kode Anak */}

                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Kode Anak</label>
                  <select
                    name="kdanak"
                    className="border rounded-lg p-2 w-24 bg-gray-100"
                    value={formData.kdanak}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-</option>
                    {konfigurasi.map((item) => (
                      <option key={item.kdanak} value={item.kdanak}>
                        {item.kdanak}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kode Tunjangan */}

                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Kode Tunjangan</label>
                  <input
                    type="text"
                    className="border rounded-lg p-2 w-24 bg-gray-100"
                    name="kdtunjangan"
                    value={formData.kdtunjangan}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/*Bulan*/}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Bulan</label>
                  <select
                    className="border rounded-lg p-2 w-24 bg-gray-100"
                    name="bulan"
                    value={formData.bulan}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Tahun</label>
                  <select
                    className="border rounded-lg p-2 w-24 bg-gray-100"
                    name="tahun"
                    value={formData.tahun}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-</option>
                    {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => (
                      <option key={i} value={2020 + i}>
                        {2020 + i}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div className="flex items-center space-x-2">
                  <label className="text-gray-700 font-medium w-32">Tanggal</label>
                  <input
                    type="date"
                    className="border rounded-lg p-2 w-1/3"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded-lg p-2 w-1/3"
                    name="formattedTanggal"
                    value={formData.tanggal ? new Date(formData.tanggal).toLocaleDateString("id-ID") : ""}
                    readOnly
                  />
                </div>

                {/* Keterangan */}
                <div className="flex items-start space-x-2">
                  <label className="text-gray-700 font-medium w-32">Keterangan</label>
                  <textarea
                    className="border rounded-lg p-2 w-5/6"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-30 h-10 bg-[#004AAD] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer mt-4"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>

          {/*list Pegawai*/}

          <div className="w-full bg-white p-6 rounded-lg shadow-lg mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">LIST PENERIMA TUNJANGAN KEHORMATAN</h2>
            </div>
            <div className="flex justify-between items-center mb-4 mt-8">
              {/* Checkbox */}
              <div className="flex space-x-2 mr-auto ml-8">
                <input
                  type="checkbox"
                  className="form-checkbox h-8 w-8 text-[#004AAD] checked:bg-[#004AAD] border-[#004AAD] text-center"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
                <div className="flex justify-between">Semua</div>
              </div>

              {/* Text Input */}
              <div className="flex space-x-2 ml-auto">
                <input
                  type="text"
                  placeholder="Cari NIP atau Nama"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                />
              </div>
            </div>
            <div className="mt-4 mb-2 w-full border-t border-gray-300" />
            <table className="min-w-full bg-white border-collapse border-gray-300 border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 w-12 px-1 py-2 text-center">Pilih</th>
                  <th className="border border-gray-300 px-2 py-4 w-20 text-center">NIP</th>
                  <th className="border border-gray-300 px-2 py-4 w-20 text-center">Nama</th>
                  <th className="border border-gray-300 px-2 py-4 w-20 text-center">Golongan</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-1 border border-gray-300 py-2 w-12 text-center">
                      <div className="flex justify-center items-center space-x-2 mx-auto">
                        <input
                          type="checkbox"
                          className="form-checkbox h-8 w-8 text-[#004AAD] checked:bg-[#004AAD] border-[#004AAD]"
                          checked={selectedItems[indexOfFirstItem + index]}
                          onChange={() => handleCheckboxChange(indexOfFirstItem + index)}
                        />
                      </div>
                    </td>
                    <td className="px-2 border border-gray-300 py-4 w-20 text-center">{item.nip}</td>
                    <td className="px-2 border border-gray-300 py-4 w-20 text-center">{item.nmpeg}</td>
                    <td className="px-2 border border-gray-300 py-4 w-20 text-center">{item.kdgol}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

          <div className="w-full bg-white p-6 rounded-lg shadow-lg mt-10">
            <table className="min-w-full bg-white border-collapse border-black border">
              <thead className="border">
                <tr className="border">
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Kode Tunjangan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">NIP</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Nama Pegawai</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Golongan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Gaji Pokok</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Besar Tunjangan</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">PPH</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Jumlah Diterima</th>
                  <th className="border border-gray-300 px-6 py-4 text-center font-normal">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {listTunjangan.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.kdtunjangan}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nip}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.nmpeg}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.kdgol}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.gjpokok.toLocaleString()}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.besartunjangan.toLocaleString()}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">{item.totalpph.toLocaleString()}</td>
                    <td className="px-6 border border-gray-300 py-4 text-center">
                      {item.jmlditerima.toLocaleString()}
                    </td>
                    <td className="px-6 border border-gray-300 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <FiEdit
                          className="text-[#2552F4] text-lg cursor-pointer hover:opacity-80"
                          onClick={() => handleEditClick(index)}
                        />
                        <TbTrash
                          className="text-[#E20202] text-lg cursor-pointer"
                          onClick={() => handleDelete(item.nip)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <Link
                href={`/admin/pembayaran/lihat-kehormatan/${kdtunjangan}`}
                className="flex flex-col items-center cursor-pointer"
              >
                <button
                  onClick={handleSaveChanges}
                  className="w-30 h-10 bg-[#FFBD59] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer mt-4"
                >
                  Simpan
                </button>
              </Link>
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-[640px]">
                <h2 className="text-2xl font-bold mb-4">Edit Data</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Tunjangan</label>
                    <input
                      type="text"
                      name="kdtunjangan"
                      value={salaryData[editingRow].kdtunjangan}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NIP</label>
                    <input
                      type="text"
                      name="nip"
                      value={salaryData[editingRow].nip}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Pegawai</label>
                    <input
                      type="text"
                      name="nmpeg"
                      value={salaryData[editingRow].nmpeg}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Golongan</label>
                    <input
                      type="text"
                      name="kdgol"
                      value={salaryData[editingRow].kdgol}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gaji Pokok</label>
                    <input
                      type="number"
                      name="gjpokok"
                      value={salaryData[editingRow].gjpokok}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Besar Tunjangan</label>
                    <input
                      type="number"
                      name="besartunjangan"
                      value={salaryData[editingRow].besartunjangan}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 bg-[#2552F4] text-white rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleEditChange}
                    className="px-4 py-2 bg-[#FFBD59] text-white rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
