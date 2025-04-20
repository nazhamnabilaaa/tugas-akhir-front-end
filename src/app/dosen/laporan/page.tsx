"use client";

import React from "react";
import Navbar from "@/components/navbar/navbar";

export default function Page() {
  return (
    <section className="text-black">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">LAPORAN</h2>
        </div>

        <div className="flex justify-between items-center mb-4 mt-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="entries" className="mr-2">
              Periode
            </label>
            <select id="entries" className="border rounded p-2 w-32">
              <option value="10">2024</option>
              <option value="20">2023</option>
              <option value="50">2022</option>
              <option value="10">2021</option>
              <option value="20">2020</option>
              <option value="50">2019</option>
              <option value="10">2018</option>
              <option value="20">2017</option>
              <option value="50">2016</option>
            </select>
            <select id="entries" className="border rounded p-2 w-32">
              <option value="10">Januari</option>
              <option value="20">Februari</option>
              <option value="50">Maret</option>
              <option value="10">April</option>
              <option value="20">Mei</option>
              <option value="50">Juni</option>
              <option value="10">Juli</option>
              <option value="20">Agustus</option>
              <option value="50">September</option>
              <option value="10">Oktober</option>
              <option value="20">November</option>
              <option value="50">Desember</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="entries" className="mr-2">
              Tampilan
            </label>
            <select id="entries" className="border rounded p-2 w-32">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2">Entri</span>
          </div>

          <div className="flex space-x-2">
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
              <th className="border border-gray-300 px-6 py-4 text-center">
                Kode Satker
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Tanggal Gaji
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Keterangan
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="px-6 border border-gray-300 py-4 text-center">
                6677
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                2024-08-08
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                Tunjangan Profesi Bulan Juli 2024
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                <div className="flex justify-center space-x-2">
                  <button className="w-30 h-10 bg-[#FFBD59] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer ">
                    Lampiran
                  </button>
                  <button className="w-30 h-10 bg-[#5575E7] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer ">
                    SSP
                  </button>
                  <button className="w-30 h-10 bg-[#E85FB9] rounded-lg py-2 px-4 flex items-center justify-center text-white hover:bg-gray-400 cursor-pointer ">
                    SPTJM
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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
