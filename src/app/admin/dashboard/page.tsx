"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Sidebar from "@/components/sidebar"
import UserTable from "@/components/UserTable"
import AddUserModal from "@/components/AddUserModal"
import type { User } from "@/types/user"
import { GrAddCircle } from "react-icons/gr"
import useAxios from "../../useAxios"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

// Gunakan dynamic import untuk AdminNavbar untuk menghindari error hydration
const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
})

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
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

    const getUser = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUsers(response.data.Data[0] || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        localStorage.removeItem("accessToken") // Hapus token yang expired
        router.push("/")
        setError("Gagal mengambil data pengguna")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [token, axiosInstance])

  const handleSaveUser = (userData: Omit<User, "uuid">) => {
    const newUser = {
      ...userData,
      uuid: Date.now().toString(), // Gunakan timestamp agar ID unik
    }
    setUsers([...users, newUser])
  }

  const handleDelete = async (uuid: string) => {
    try {
      const result = await Swal.fire({
        title: `Hapus Akun Pengguna ini?`,
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
      await axiosInstance.delete(`${apiUrl}/users/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire("Berhasil!", "Data berhasil dihapus.", "success")

      // Perbarui state untuk menghapus data dari daftar
      setUsers((prevUsers) => prevUsers.filter((item) => item.uuid !== uuid))
    } catch (error) {
      console.error("Error deleting data:", error)
      Swal.fire("Error", "Terjadi kesalahan saat menghapus data.", "error")
    }
  }

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        Object.values(user).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : []

  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const displayedUsers = filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <section className="flex-1 text-black px-16">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-4">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>

          {/* User Management Section */}
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Kelola Akun Pengguna</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="tampilan" className="mr-2">
                  Tampilan
                </label>
                <select
                  id="tampilan"
                  className="border rounded p-2 w-32"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value))
                    setCurrentPage(1) // Reset to first page when changing entries per page
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
                  placeholder="Cari"
                  className="border rounded py-2 px-4 focus:outline-none focus:ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 mb-2 w-full border-t border-gray-300" />

            <UserTable users={displayedUsers} onDelete={handleDelete} />

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

          {/* Add User Modal */}
          <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />
        </section>
      </div>
    </div>
  )
}
