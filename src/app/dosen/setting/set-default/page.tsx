import React from "react";
import Navbar from "@/components/navbar/navbar";

export default function Page() {
  return (
    <section className="text-black px-16">
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">SET DEFAULT ANAK SATKER</h2>
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
                Kode
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Nama
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Jenis
              </th>
              <th className="border border-gray-300 px-6 py-4 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="px-6 border border-gray-300 py-4 text-center">
                6677 01
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                Rektorat Universitas Mataram
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                PNS
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                <div className="flex justify-center space-x-2">
                  <button className="bg-[#FFBD59] text-white px-8 py-2 rounded-xl hover:bg-gray-400  focus:outline-none">
                    Default
                  </button>
                </div>
              </td>
            </tr>
            <tr className="border">
              <td className="px-6 border border-gray-300 py-4 text-center">
                6677 02
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                Fakultas Teknik Universitas Mataram
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                PNS
              </td>
              <td className="px-6 border border-gray-300 py-4 text-center">
                <div className="flex justify-center space-x-2">
                  <button className="bg-[#FFBD59] text-white px-8 py-2 rounded-xl hover:bg-gray-400 focus:outline-none">
                    Default
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
