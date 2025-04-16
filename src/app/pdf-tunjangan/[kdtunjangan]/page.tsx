"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar";
import { GrAddCircle } from "react-icons/gr";
import routes from "@/routes"; // Pastikan path ini benar

// Simulasi data, ini bisa diganti dengan data hasil fetch dari API nanti
const initialData = [
  {
    nmpeg: "Dian Sastro",
    nip: "198001012010011001",
    kodeJabatan: "31",
    kodeKawin: "1",
    gajiBersih: "5.000.000",
    noGaji: "123/ABC/2023",
    bulan: "Juli",
    tahun: "2023",
    kodeGolongan: "3A",
    kodeKedudukan: "1",
    npwp: "12.345.678.9-123.000",
    namaRekening: "John Doe",
    namaBank: "Bank Central",
    noRekening: "1234567890",
    kodeBankSpan: "002",
    namaBankSpan: "Bank Central",
    kodeNegara: "ID",
    kodeKPPN: "018",
    kodePos: "12345",
    gajiPokok: "4.500.000",
    kodeGajiPokok: "3A/01",
    bpjs: "200.000",
    kodeAnak: "2",
  },
];

export default function Page() {
  const [data, setData] = useState<any[]>(initialData);

  // Fetch data jika perlu
  useEffect(() => {
    // Contoh pengambilan data dari API
    // Ganti URL dengan endpoint yang sesuai
    fetch("/api/tunjangan")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <section className="flex-1 text-black px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg mt-10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse border-gray-300 table-auto">
                <thead className="border">
                  <tr className="border">
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Nama Pegawai
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      NIP
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Jabatan
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Kawin
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Gaji Bersih
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      No. Gaji
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Bulan
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Tahun
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Golongan
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Kedudukan
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      NPWP
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Nama Rekening
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Nama Bank
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      No. Rekening
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Bank SPAN
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Nama Bank SPAN
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Negara
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode KPPN
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Pos
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Gaji Pokok
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Gaji Pokok
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      BPJS
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm">
                      Kode Anak
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.nmpeg}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.nip}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeJabatan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeKawin}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.gajiBersih}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.noGaji}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.bulan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.tahun}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeGolongan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeKedudukan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.npwp}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.namaRekening}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.namaBank}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.noRekening}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeBankSpan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.namaBankSpan}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeNegara}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeKPPN}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodePos}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.gajiPokok}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeGajiPokok}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.bpjs}
                      </td>
                      <td className="px-3 border border-gray-300 py-2 text-center text-xs sm:text-sm">
                        {item.kodeAnak}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
