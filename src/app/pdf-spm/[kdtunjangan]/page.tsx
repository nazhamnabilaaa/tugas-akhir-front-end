"use client";

import React, { useState, useEffect } from "react";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx-js-style";

interface listTunjanganPegawai {
  kdanak: string;
  kdtunjangan: string;
  nip: string;
  nmpeg: string;
  kdgol: string;
  gjpokok: number;
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
  const params = useParams();
  const kdtunjangan = params.kdtunjangan ?? "";

  const [tanggalTunjangan, setTanggalTunjangan] = useState<TanggalTunjangan[]>([]);
  const [listTunjangan, setListTunjangan] = useState<listTunjanganPegawai[]>([]);

  const axiosInstance = useAxios();
  const router = useRouter();
  const [token, setToken] = useState("");

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
            localStorage.removeItem("accessToken");
            router.push("/");
          } else {
            setToken(accessToken);
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const GetTanggalTunjangan = async () => {
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

        const filteredData = data.flatMap((item) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => innerItem.kdtunjangan && String(innerItem.kdtunjangan) === String(kdtunjangan));
          }
          return [];
        });

        setTanggalTunjangan(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    GetTanggalTunjangan();
  }, [token, axiosInstance, kdtunjangan, router]);

  useEffect(() => {
    if (!token) return;

    const getListTunjangan = async () => {
      try {
        const response1 = await axiosInstance.get(`${apiUrl}/tunjangankehormatan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const response2 = await axiosInstance.get(`${apiUrl}/tunjanganprofesi`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = [...response1.data.Data, ...response2.data.Data];

        const filteredData = data.flatMap((item) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => innerItem.kdtunjangan && String(innerItem.kdtunjangan) === String(kdtunjangan));
          }
          return [];
        });

        setListTunjangan(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    getListTunjangan();
  }, [token, kdtunjangan, axiosInstance, router]);

  const mergedData = listTunjangan.map((item) => {
    const tanggalTunjanganItem = tanggalTunjangan.find((t) => t.kdtunjangan === item.kdtunjangan);
    return {
      ...item,
      kdanak: tanggalTunjanganItem ? tanggalTunjanganItem.kdanak : item.kdanak,
    };
  });

  const exportToExcel = () => {
    const worksheetData = [
      ["No", "Nama Pegawai", "Nama Pemilik Rekening", "Rekening", "Gaji Pokok"],
      ...mergedData.map((item, index) => [
        index + 1,
        item.nmpeg,
        item.nmrek,
        item.rekening,
        item.gjpokok,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    const columnWidths = worksheetData[0].map((_, colIndex) => {
      const maxLength = worksheetData.reduce((max, row) => {
        const cellValue = row[colIndex] ? row[colIndex].toString() : "";
        return Math.max(max, cellValue.length);
      }, 10);
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = columnWidths;

    worksheetData[0].forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
      };
    });

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
              {["No", "Nama Pegawai", "Nama Pemilik Rekening", "Nomor Rekening", "Jumlah Uang"].map(
                (header, index) => (
                  <th key={index} className="border border-white px-3 py-2 text-center">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="text-black">
            {mergedData.map((item, index) => (
              <tr key={index} className="text-sm text-center border-b border-gray-300 hover:bg-gray-100">
                <td className="border border-gray-400 px-3 py-2">{index + 1}</td>
                <td className="border border-gray-400 px-3 py-2">{item.nmpeg}</td>
                <td className="border border-gray-400 px-3 py-2">{item.nmrek}</td>
                <td className="border border-gray-400 px-3 py-2">{item.rekening}</td>
                <td className="border border-gray-400 px-3 py-2">
                  Rp {item.gjpokok.toLocaleString("id-ID")}
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
