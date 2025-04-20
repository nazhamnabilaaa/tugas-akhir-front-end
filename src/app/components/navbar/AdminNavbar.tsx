"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown, LogOut } from "lucide-react"; // Removed Settings import
import useAxios from "../../useAxios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const axiosInstance = useAxios();
  const router = useRouter();
  const apiUrl = "http://localhost:8080";

  const toggleDropdown = () => {
    setActiveDropdown(!activeDropdown);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Apakah anda yakin?",
      text: "Anda akan keluar dari Dospay!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar!",
    });
  
    if (result.isConfirmed) {
      try {
        const logoutUrl = `${apiUrl}/logout`;
        console.log("Logout API URL:", logoutUrl);
  
        const response = await axiosInstance.delete(logoutUrl, {
          withCredentials: true, // ✅ Kirim cookie untuk autentikasi
        });
  
        console.log("Logout Response:", response.status, response.data);
  
        if (response.status === 200) {
          // ✅ Hapus token dari localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
  
          // ✅ Hapus header Authorization dari axios instance
          delete axiosInstance.defaults.headers.common["Authorization"];
  
          Swal.fire("Berhasil", "Anda telah logout.", "success").then(() => {
            router.push("/"); // ✅ Redirect ke halaman utama
          });
        }
      } catch (error) {
        console.error("Failed to logout", error.response?.status, error.response?.data);
  
        Swal.fire({
          title: "Error",
          text: `Gagal logout. ${error.response?.data?.message || "Silakan coba lagi."}`,
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="w-full px-4 lg:px-16">
        <section className="text-black flex justify-between items-center h-20">
          <div className="flex items-center">
            <Image
              alt="Logo"
              className="h-12 w-auto"
              src="/assets/img/logo/logo.png"
              width={48}
              height={48}
              priority
            />
          </div>

          {/* Hamburger Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Profile Dropdown */}
          <div
            className={`
              fixed md:relative top-20 md:top-0 right-0 w-full md:w-auto
              bg-white md:bg-transparent
              ${isMenuOpen ? "block" : "hidden"} md:block
              p-4 md:p-0 z-50
            `}
          >
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 w-full md:w-auto justify-between"
              >
                <div className="flex items-center">
                  <Image
                    src="/assets/img/profile/image 1.png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <ChevronDown className="ml-2 h-4 w-4" />
                </div>
              </button>
              {activeDropdown && (
                <div className="md:absolute md:top-full md:right-0 mt-1 md:mt-2 w-max p-2 rounded-xl text-white bg-[#004AAD] shadow-lg md:z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-blue-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNavbar;
