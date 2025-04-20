"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Settings, LogOut } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const UserNavbar = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const axiosInstance = useAxios();
  const router = useRouter();
  const apiUrl = "http://localhost:8080";
  const [uuid, setUUID] = useState(""); // Hapus token karena tidak digunakan

  const isActive = (path: string) =>
    pathname.startsWith(path) ? "text-[#004AAD]" : "";

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const renderDropdownMenu = (
    items: { label: string; href?: string; icon?: React.ReactNode; onClick?: () => void }[]
  ) => (
    <ul className="md:absolute md:top-full md:left-0 mt-1 w-full md:w-max p-2 rounded-xl text-white bg-[#004AAD] shadow-lg md:z-50">
      {items.map((item, index) => (
        <li key={index} className="py-1">
          {item.href ? (
            <Link
              href={item.href}
              className="block px-4 py-2 hover:bg-blue-600 rounded whitespace-nowrap flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <button
              onClick={item.onClick}
              className="block px-4 py-2 w-full text-left hover:bg-blue-600 rounded flex items-center"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/");
      } else {
        try {
          const decoded = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
  
          if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired");
            localStorage.removeItem("accessToken"); // Hapus token expired
            router.push("/"); // Redirect ke login
          } else {
            setUUID(decoded.uuid);
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, [router]); // Menambahkan router ke dalam daftar dependensi

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

          {/* Navigation Links */}
          <div
            className={`
            fixed md:relative top-20 md:top-0 left-0 w-full md:w-auto
            bg-white md:bg-transparent
            ${isMenuOpen ? "block" : "hidden"} md:block
            border-b md:border-none
            p-4 md:p-0
            z-50
          `}
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <Link
                href="/dosen/dashboard"
                className={`text-[15px] hover:text-[#004AAD] transition-colors ${isActive(
                  "/dosen/dashboard"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown("setting")}
                  className={`text-[15px] flex items-center hover:text-[#004AAD] transition-colors w-full md:w-auto justify-between ${isActive(
                    "/dosen/setting"
                  )}`}
                >
                  Setting <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {activeDropdown === "setting" &&
                  renderDropdownMenu([
                    {
                      label: "Referensi Satker",
                      href: "/dosen/setting/referensi-satker",
                    },
                  ])}
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown("pembayaran")}
                  className={`text-[15px] flex items-center hover:text-[#004AAD] transition-colors w-full md:w-auto justify-between ${isActive(
                    "/dosen/pembayaran"
                  )}`}
                >
                  Pembayaran <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {activeDropdown === "pembayaran" &&
                  renderDropdownMenu([
                    {
                      label: "Tunjangan Profesi",
                      href: "/dosen/pembayaran/tunjangan-profesi",
                    },
                    {
                      label: "Tunjangan Kehormatan",
                      href: "/dosen/pembayaran/tunjangan-kehormatan",
                    },
                  ])}
              </div>

              <Link
                href="/dosen/export-file"
                className={`text-[15px] hover:text-[#004AAD] transition-colors ${isActive(
                  "/dosen/export-file"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Export File
              </Link>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown("profile")}
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
                {activeDropdown === "profile" &&
                  renderDropdownMenu([
                    {
                      label: "Profil",
                      href: `/dosen/profile/${uuid}`,
                      icon: <CgProfile className="w-4 h-4" />,
                    },
                    {
                      label: "Pengaturan",
                      href: `/dosen/pengaturan/${uuid}`,
                      icon: <Settings className="w-4 h-4" />,
                    },
                    {
                      label: "Keluar",
                      onClick: handleLogout,
                      icon: <LogOut className="w-4 h-4" />,
                    },
                  ])}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserNavbar;
