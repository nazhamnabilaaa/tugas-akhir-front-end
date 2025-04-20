"use client";

import React from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/sidebar";

// Gunakan dynamic import untuk AdminNavbar agar konsisten dengan dashboard
const AdminNavbar = dynamic(() => import("@/components/navbar/AdminNavbar"), {
  ssr: false,
  loading: () => <div>Loading Navbar...</div>,
});

export default function Page() {
  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <section className="flex-1 text-black px-16">
          {/* Pengaturan Akun Section */}

          {/* Form Section */}
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-center mb-4">
              PENGATURAN AKUN
            </h2>
            <div className="flex flex-col md:flex-row md:space-x-8 w-full justify-center items-center">
              {/* Form Fields */}
              <div className="flex-1 space-y-4 w-full max-w-md">
                <div className="space-y-2">
                  <label className="text-xl text-black" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    className="border rounded-xl py-2 px-4 w-full focus:outline-none focus:ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xl text-black" htmlFor="password">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="border rounded-xl py-2 px-4 w-full focus:outline-none focus:ring"
                  />
                </div>
                <div className="mt-6 flex justify-center w-full">
                  <button className="w-full py-2 bg-[#004AAD] text-white font-semibold rounded-xl hover:bg-gray-300 transition duration-200 mt-4">
                    Simpan
                  </button>
                </div>
                <div className="mt-4 mb-2 w-full border-t border-gray-300"></div>
                <div className="mt-2 flex justify-center w-full">
                  <button className="w-full py-2 bg-[#FFBD59] text-white font-semibold rounded-xl hover:bg-gray-300 transition duration-200 mt-2">
                    Hapus Akun
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
