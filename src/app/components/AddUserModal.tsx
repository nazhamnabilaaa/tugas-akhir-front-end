"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import Swal from "sweetalert2"
import useAxios from "../useAxios"
import { AxiosError } from "axios"  // Import AxiosError untuk tipe error

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Omit<User, "uuid">) => void
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const axiosInstance = useAxios()
  const [token, setToken] = useState("")
  const [formData, setFormData] = useState({
    namalengkap: "",
    nip: "",
    username: "",
    email: "",
    notelp: "",
    password: "",
    confPassword: "",
    alamat: "",
    role: "",
  })

  const apiUrl = "http://localhost:8080"

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) setToken(storedToken)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { password, confPassword } = formData

    if (!password.trim() || !confPassword.trim()) {
      Swal.fire("Error", "Password dan Konfirmasi Password wajib diisi!", "error")
      return
    }

    if (password !== confPassword) {
      Swal.fire("Error", "Password dan Konfirmasi Password tidak cocok!", "error")
      return
    }

    // Konfirmasi sebelum menyimpan
    const result = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin menyimpan Data Akun Pengguna ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    })

    if (result.isConfirmed) {
      try {
        const data = { ...formData }

        console.log("Data yang dikirim ke backend:", data)

        const response = await axiosInstance.post(`${apiUrl}/users`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Response dari backend:", response.data)

        if (response.status === 201) {
          Swal.fire("Data Akun Pengguna telah disimpan!", "", "success").then(() => {
            window.location.reload()
          })
        } else {
          Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error")
        }
      } catch (error) {
        // Gunakan tipe AxiosError untuk menangani kesalahan
        const axiosError = error as AxiosError
        console.error("Error dari backend:", axiosError.response?.data || axiosError.message)
        Swal.fire("Error", "Terjadi kesalahan: " + (axiosError.response?.data?.msg || axiosError.message), "error")
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-xl relative" style={{ maxHeight: "90vh", margin: "20px auto" }}>
        {/* Close button - positioned outside the scrollable area */}
        <div className="sticky top-0 right-0 p-4 bg-white rounded-t-lg flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">TAMBAH AKUN PENGGUNA</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 70px)" }}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {Object.entries(formData).map(([key, value]) =>
                key !== "role" && key !== "password" && key !== "confPassword" ? (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {key
                        .replace("notelp", "No Telepon")
                        .replace("namalengkap", "Nama Lengkap")
                        .replace("nip", "NIP")
                        .replace("alamat", "Alamat")
                        .replace("username", "Username")
                        .replace("email", "Email")}
                    </label>
                    <input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : null,
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confPassword"
                  value={formData.confPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Akun</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Pilih Jenis Akun
                  </option>
                  <option value="admin">Admin</option>
                  <option value="bendahara">Bendahara</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFB84C] hover:bg-[#FFA82C] text-white py-3 rounded-lg transition-colors mt-6"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddUserModal
