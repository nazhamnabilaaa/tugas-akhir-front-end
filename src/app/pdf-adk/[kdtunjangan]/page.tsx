"use client";

import React, { useState, useEffect } from "react";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import {useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx-js-style";

interface listTunjanganPegawai {
  kdanak: string;
  kdtunjangan: string;
  nip: string;
  nmpeg: string;
  kdgol: string;
  gjpokok: string;
  nmrek: string;
  nm_bank: string;
  kdbankspan: string;
  rekening: string;
  npwp: string;
  besartunjangan: number;
  pajakpph: number;
  totalpph: number;
  jmlditerima: number;
} 

interface TanggalTunjangan {
  kdanak: string;
  kdtunjangan: string;
  bulan: string;
  tahun: string;
  keterangan: string;
  tanggal: string;
  jenisTunjangan: string;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const kdtunjangan = params.kdtunjangan ?? "";

  
  const [tanggalTunjangan, setTanggalTunjangan] = useState<TanggalTunjangan[]>([]);
  const [listTunjangan, setListTunjangan] = useState<listTunjanganPegawai[]>([]);
  const [totalBesartunjangan, setTotalBesartunjangan] = useState(0);
  const [totalPPH, setTotalPPH] = useState(0);
  const [totalJmlDiterima, setTotalJmlDiterima] = useState(0);
  const [showBesaranTunjangan, setShowBesaranTunjangan] = useState(false);

  const axiosInstance = useAxios();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [namalengkap, setNamalengkap] = useState("");
  

  const apiUrl = "http://localhost:8080";

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
            setToken(accessToken);
            setNamalengkap(decoded.namalengkap);
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const GetTanggalTunjangan = async () => {
      setLoading(true);
      try {
        const [profesiRes, kehormatanRes] = await Promise.all([
          axiosInstance.get(`${apiUrl}/tanggalprofesi`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get(`${apiUrl}/tanggalkehormatan`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const data = [...profesiRes.data.Data, ...kehormatanRes.data.Data]; 
        console.log("Combined Data:", data);

        data.forEach((item, index) => {
          console.log(`Data item ke-${index}:`, item);
          console.log(`kdtunjangan item ke-${index}:`, item.kdtunjangan);
        });

        const filteredData = data.flatMap((item, index) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => {
              console.log("Membandingkan kdtunjangan dalam innerItem:", innerItem.kdtunjangan);
              return innerItem.kdtunjangan && String(innerItem.kdtunjangan) === String(kdtunjangan);
            });
          }
          return [];
        });
        

        setTanggalTunjangan(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data.");
        localStorage.removeItem("accessToken");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    GetTanggalTunjangan();
  }, [token, axiosInstance]);

  useEffect(() => {
    if (!token) return;
    console.log("kdtunjangan:", kdtunjangan);
  
    const getListTunjangan = async () => {
      try {
        const response1 = await axiosInstance.get(`${apiUrl}/tunjangankehormatan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const response2 = await axiosInstance.get(`${apiUrl}/tunjanganprofesi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = [...response1.data.Data, ...response2.data.Data]; 
        console.log("Data dari Tunjangan Kehormatan:", response1.data.Data);
        console.log("Data dari Tunjangan Profesi:", response2.data.Data);

        data.forEach((item, index) => {
          console.log(`Data item ke-${index}:`, item);
          console.log(`kdtunjangan item ke-${index}:`, item.kdtunjangan);
        });

        const filteredData = data.flatMap((item, index) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => {
              console.log("Membandingkan kdtunjangan dalam innerItem:", innerItem.kdtunjangan);
              return innerItem.kdtunjangan && String(innerItem.kdtunjangan) === String(kdtunjangan);
            });
          }
          return [];
        });

        console.log("filtered data :", filteredData);

        const hasBesaranTunjangan = filteredData.some((item) => item.besartunjangan > 0);

        setShowBesaranTunjangan(hasBesaranTunjangan);

        setListTunjangan(filteredData);

        const totalBesaran = filteredData.reduce((sum, item) => sum + item.besartunjangan, 0);
        const totalPph = filteredData.reduce((sum, item) => sum + item.totalpph, 0);
        const totalJml = filteredData.reduce((sum, item) => sum + item.jmlditerima, 0);

        setTotalBesartunjangan(totalBesaran);
        setTotalPPH(totalPph);
        setTotalJmlDiterima(totalJml);
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data Pegawai");
      } finally {
        setLoading(false);
      }
    };
  
    getListTunjangan();
  }, [token, kdtunjangan, axiosInstance]);

  const mergedData = listTunjangan.map((item) => {
    const tanggalTunjanganItem = tanggalTunjangan.find((t) => t.kdtunjangan === item.kdtunjangan);
    return {
      ...item,
      kdanak: tanggalTunjanganItem ? tanggalTunjanganItem.kdanak : item.kdanak,
    };
  });

  

  const exportToExcel = () => {
    const worksheetData = [
      [
        "No",
        "Kode Anak",
        "Kode Tunjangan",
        "NIP",
        "Nama Pegawai",
        "NPWP",
        "Nama Rekening",
        "Nama Bank",
        "Rekening",
        "Site Bank"
      ],
      ...mergedData.map((item, index) => [
        index + 1,
        item.kdanak,
        item.kdtunjangan,
        item.nip,
        item.nmpeg,
        item.npwp,
        item.nmrek,
        item.nm_bank,
        item.rekening,
        `${item.kdbankspan}_${item.rekening}`,
      ]),
    ];
  
    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
  
    // Auto width: hitung panjang karakter tiap kolom
    const columnWidths = worksheetData[0].map((_, colIndex) => {
      const maxLength = worksheetData.reduce((max, row) => {
        const cellValue = row[colIndex] ? row[colIndex].toString() : "";
        return Math.max(max, cellValue.length);
      }, 10); //
      return { wch: maxLength + 2 }; 
    });
    worksheet["!cols"] = columnWidths;
  
    // Terapkan gaya pada header
    worksheetData[0].forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
      };
    });
  
    // Terapkan perataan tengah pada kolom "No"
    for (let i = 1; i <= mergedData.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = {
        alignment: { horizontal: "center" },
      };
    }
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tunjangan");
    XLSX.writeFile(workbook, `Data_Tunjangan_${kdtunjangan}.xlsx`);
  };
  

  return (
    <div className="flex flex-col p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-400 shadow-lg bg-white">
          <thead>
            <tr className="bg-blue-500 text-white text-sm">
              {[
                "No",
                "Kode Anak",
                "Kode Tunjangan",
                "NIP",
                "Nama Pegawai",
                "NPWP",
                "Nama Rekening",
                "Nama Bank",
                "Rekening",
                "Site Bank",
              ].map((header, index) => (
                <th
                  key={index}
                  className="border border-white px-3 py-2 text-center"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-black">
            {mergedData.map((item, index) => (
              <tr
                key={index}
                className="text-sm text-center border-b border-gray-300 hover:bg-gray-100"
              >
                <td className="border border-gray-400 px-3 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.kdanak}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.kdtunjangan}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nip}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nmpeg}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.npwp}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nmrek}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nm_bank}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.rekening}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                {`${item.kdbankspan}_${item.rekening}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4 gap-4">
        <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Export ke Excel
        </button>
      </div>
    </div>
  );
}
