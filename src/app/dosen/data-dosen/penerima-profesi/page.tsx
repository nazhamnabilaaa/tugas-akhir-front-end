"use client";

import React from "react";
import Navbar from "@/components/navbar/navbar";

export default function Page() {
  return (
    <section className="text-black px-16">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            LIST PENERIMA TUNJANGAN PROFESI
          </h2>
        </div>
        <div className="flex justify-between items-center mb-4 mt-8">
          {/* Checkbox */}
          <div className="flex space-x-2 mr-auto ml-8">
            <input
              type="checkbox"
              className="form-checkbox h-8 w-8 text-[#004AAD] checked:bg-[#004AAD] border-[#004AAD] text-center"
            />
            <div className="flex justify-between">Semua</div>
          </div>

          {/* Text Input */}
          <div className="flex space-x-2 ml-auto">
            <input
              type="text"
              placeholder="Cari"
              className="border rounded py-2 px-4 focus:outline-none focus:ring"
            />
          </div>
        </div>
        <div className="mt-4 mb-2 w-full border-t border-gray-300" />
        <table className="min-w-full bg-white border-collapse border-gray-300 border">
          <thead className="border">
            <tr className="border">
              <th className="border border-gray-300 w-12 px-1 py-2 text-center">
                Pilih
              </th>
              <th className="border border-gray-300 px-2 py-4 w-20 text-center">
                NIP
              </th>
              <th className="border border-gray-300 px-2 py-4 w-20 text-center">
                Nama
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="px-1 border border-gray-300 py-2 w-12 text-center">
                <div className="flex justify-center items-center space-x-2 mx-auto">
                  <input
                    type="checkbox"
                    className="form-checkbox h-8 w-8 text-[#004AAD] checked:bg-[#004AAD] border-[#004AAD]"
                  />
                </div>
              </td>
              <td className="px-2 border border-gray-300 py-4 w-20 text-center">
                1987654321
              </td>
              <td className="px-2 border border-gray-300 py-4 w-20 text-center">
                Dian Sastro
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <button className="w-30 h-10 bg-[#004AAD] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer mt-4">
            Simpan
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2 justify-end w-full">
            {/* Previous button in a circle */}
            <button className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer">
              ‹
            </button>
            <span className="w-7 h-7 bg-[#18A3DC] rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer">
              1
            </span>
            {/* Next button in a circle */}
            <button className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 cursor-pointer">
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
