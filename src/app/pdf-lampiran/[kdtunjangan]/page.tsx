"use client";

import React, { useState, useEffect } from "react";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import {useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface listTunjanganPegawai {
  kdanak: string;
  kdtunjangan: string;
  nip: string;
  nmpeg: string;
  kdgol: string;
  gjpokok: string;
  nmrek: string;
  nm_bank: string;
  rekening: string;
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

interface Pejabat {
  kdanak: string;
  nik: string;
  nip: string;
  nmpeg: string;
  kdjab: string;
  nmjab: string;
  kdduduk: string;
  jurubayar: string;
}

interface Rektor {
  kdsatker: string;
  nmsatker: string;
  nik: string;
  nip: string;
  nmpeg: string;
  gelarRektor: string;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const kdtunjangan = params.kdtunjangan ?? "";

  const [selectedPejabat, setSelectedPejabat] = useState<string>(""); 
  const [selectedNIP, setSelectedNIP] = useState<string>(""); 
  const [selectedRektor, setSelectedRektor] = useState<string>(""); 
  const [selectedNIPREKTOR, setSelectedNIPREKTOR] = useState<string>(""); 
  const [tanggalTunjangan, setTanggalTunjangan] = useState<TanggalTunjangan[]>([]);
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([]);
  const [rektorList, setRektorList] = useState<Rektor[]>([]);
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

        data.forEach((item, index) => {
        });

        const filteredData = data.flatMap((item, index) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => {
              return innerItem.kdtunjangan && String(innerItem.kdtunjangan) === String(kdtunjangan);
            });
          }
          return [];
        });

        const hasBesaranTunjangan = filteredData.some((item) => item.besartunjangan && item.besartunjangan > 0);

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

  useEffect(() => {
    if (!token) return;

    const getPejabat = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/ruhpejabat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPejabatList(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data PEJABAT");
      } finally {
        setLoading(false);
      }
    };

    getPejabat();
  }, [token, axiosInstance]);

  useEffect(() => {
    if (!token) return;

    const getRektor = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/rektor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRektorList(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data PEJABAT");
      } finally {
        setLoading(false);
      }
    };

    getRektor();
  }, [token, axiosInstance]);

  const mergedData = listTunjangan.map((item) => {
    const tanggalTunjanganItem = tanggalTunjangan.find((t) => t.kdtunjangan === item.kdtunjangan);
    return {
      ...item,
      kdanak: tanggalTunjanganItem ? tanggalTunjanganItem.kdanak : item.kdanak,
    };
  });

  function angkaKeRomawi(angka) {
    const romawi = [
      { nilai: 1000, simbol: "M" },
      { nilai: 900, simbol: "CM" },
      { nilai: 500, simbol: "D" },
      { nilai: 400, simbol: "CD" },
      { nilai: 100, simbol: "C" },
      { nilai: 90, simbol: "XC" },
      { nilai: 50, simbol: "L" },
      { nilai: 40, simbol: "XL" },
      { nilai: 10, simbol: "X" },
      { nilai: 9, simbol: "IX" },
      { nilai: 5, simbol: "V" },
      { nilai: 4, simbol: "IV" },
      { nilai: 1, simbol: "I" }
    ];
  
    let hasil = "";
  
    for (let i = 0; i < romawi.length; i++) {
      while (angka >= romawi[i].nilai) {
        hasil += romawi[i].simbol;
        angka -= romawi[i].nilai;
      }
    }
    return hasil;
  }

  function formatTanggal(tanggal) {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: 'numeric', // "2"
      month: 'long', // "Januari"
      year: 'numeric', // "2025"
    });
  }
  

  const exportToExcel = () => {
    if (listTunjangan.length === 0) {
      Swal.fire("Peringatan", "Tidak ada data untuk diekspor", "warning");
      return;
    }
  
    const headerData = [
      ["DAFTAR PERHITUNGAN PEMBAYARAN"],
      [`TUNJANGAN: ${tanggalTunjangan.length > 0 ? tanggalTunjangan[0].jenisTunjangan : ""}`],
      [`Sesuai SK No. ..... /UN18/KP/...... Tanggal ${tanggalTunjangan.length > 0 ? formatTanggal(tanggalTunjangan[0].tanggal) : "-"}`]
    ];
  
    const tableHeaders = [
      "Kode Anak",
      "Kode Tunjangan",
      "NIP",
      "Nama Pegawai",
      "Gol",
      showBesaranTunjangan ? "Besaran Tunjangan" : null,
      "PPH",
      "Jumlah Bersih",
      "Nama Bank",
      "Nama Rekening",
      "No. Rekening"
    ].filter(Boolean);
  
    const tableData = mergedData.map((item) => [
      item.kdanak,
      item.kdtunjangan,
      item.nip,
      item.nmpeg,
      angkaKeRomawi(Number(item.kdgol)),
      showBesaranTunjangan ? (item.besartunjangan ? `Rp ${item.besartunjangan.toLocaleString("id-ID")}` : '-') : null,
      `Rp ${item.totalpph.toLocaleString("id-ID")}`,
      `Rp ${item.jmlditerima.toLocaleString("id-ID")}`,
      item.nm_bank,
      item.nmrek,
      item.rekening,
    ].filter(Boolean));
  
    const sheetData = [
      ...headerData,
      [],
      tableHeaders,
      ...tableData,
    ];
  
    const ws = XLSX.utils.aoa_to_sheet(sheetData, { sheetStubs: true })
  
    // --- Style Header Dokumen ---
    const centerStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      font: { bold: true, size: 14 }
    };
    ws["A1"].s = centerStyle;
    ws["A2"].s = { ...centerStyle, font: { bold: true, size: 12 } };
    ws["A3"].s = { ...centerStyle, font: { italic: true, size: 11 } };
  
    // Merge kolom judul supaya rata tengah
    const mergeLength = tableHeaders.length - 1;
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: mergeLength } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: mergeLength } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: mergeLength } },
    ];
  
    // --- Style Header Tabel ---
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D9E1F2" } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: "center", vertical: "center", wrapText: true }
    };
  
    for (let i = 0; i < tableHeaders.length; i++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 4, c: i })];
      if (cell) cell.s = headerStyle;
    }
  
    // --- Style Data Tabel ---
    tableData.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cell = ws[XLSX.utils.encode_cell({ r: rowIndex + 5, c: colIndex })];
        if (cell) {
          cell.s = {
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });
    });
  
    // --- Total Row ---
    const totalRow = [
      'JUMLAH TOTAL:',
      '', '', '', '',
      showBesaranTunjangan ? `Rp ${totalBesartunjangan.toLocaleString("id-ID")}` : '-',
      `Rp ${totalPPH.toLocaleString("id-ID")}`,
      `Rp ${totalJmlDiterima.toLocaleString("id-ID")}`,
      '', '', ''
    ];
    sheetData.push([]);
    sheetData.push(totalRow);
  
    const totalRowIndex = sheetData.length - 1;
    totalRow.forEach((_, colIndex) => {
      const cell = ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    });
  
    // --- Tanda Tangan ---
    const signData = [
      [],
      ["Mengetahui,"],
      ["Kuasa Pengguna Anggaran", "", "", "", "", "", "", "", "Pejabat Pembuat Komitmen"],
      [selectedRektor || "Belum Dipilih", "", "", "", "", "", "", "", selectedPejabat || "Belum Dipilih"],
      [`NIP: ${selectedNIPREKTOR || "Belum Dipilih"}`, "", "", "", "", "", "", "", `NIP: ${selectedNIP || "Belum Dipilih"}`]
    ];
  
    sheetData.push(...signData);
  
    const finalSheet = XLSX.utils.aoa_to_sheet(sheetData);
  
    // Merge untuk tanda tangan
    finalSheet["!merges"] = [
      ...ws["!merges"] || [],
      { s: { r: sheetData.length - 3, c: 0 }, e: { r: sheetData.length - 3, c: 2 } },
      { s: { r: sheetData.length - 3, c: 8 }, e: { r: sheetData.length - 3, c: 10 } },
      { s: { r: sheetData.length - 2, c: 0 }, e: { r: sheetData.length - 2, c: 2 } },
      { s: { r: sheetData.length - 2, c: 8 }, e: { r: sheetData.length - 2, c: 10 } },
      { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 2 } },
      { s: { r: sheetData.length - 1, c: 8 }, e: { r: sheetData.length - 1, c: 10 } },
    ];
  
    // === AUTO-WIDTH ===
    const allRows = [tableHeaders, ...tableData, totalRow];
    const columnWidths = allRows[0].map((_, colIndex) => {
      const maxWidth = allRows.reduce((max, row) => {
        const cell = row[colIndex];
        const cellLength = cell ? cell.toString().length : 0;
        return Math.max(max, cellLength);
      }, 10);
      return { wch: maxWidth + 2 };
    });
    finalSheet["!cols"] = columnWidths;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, finalSheet, "Tunjangan");
    XLSX.writeFile(wb, `Tunjangan_${kdtunjangan}.xlsx`);
  };
  

  const exportToPDF = () => {
    if (listTunjangan.length === 0) {
      Swal.fire("Peringatan", "Tidak ada data untuk diekspor", "warning");
      return;
    }
  
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2; 
    
    // Header Dokumen
    doc.setFontSize(14);
    doc.text("DAFTAR PERHITUNGAN PEMBAYARAN", centerX, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`TUNJANGAN ${tanggalTunjangan.length > 0 ? tanggalTunjangan[0].jenisTunjangan : ""}`, centerX, 25, { align: "center" });

    const tanggalSK = tanggalTunjangan.length > 0 ? formatTanggal(tanggalTunjangan[0].tanggal) : "-";
    doc.setFontSize(10);
    doc.text(`Sesuai SK No. ..... /UN18/KP/...... Tanggal ${tanggalSK}`, centerX, 35, { align: "center" });

    // Header Tabel
    const tableHeaders = [
      "Kode Anak",
      "Kode Tunjangan",
      "NIP",
      "Nama Pegawai",
      "Gol",
      showBesaranTunjangan ? "Besaran Tunjangan" : null,
      "PPH",
      "Jumlah Bersih",
      "Nama Bank",
      "Nama Rekening",
      "No. Rekening"
    ].filter(Boolean);

    // Data Tabel
    const tableData = mergedData.map((item) => [
      item.kdanak,
      item.kdtunjangan,
      item.nip,
      item.nmpeg,
      angkaKeRomawi(Number(item.kdgol)),
      showBesaranTunjangan ? (item.besartunjangan ? `Rp ${item.besartunjangan.toLocaleString("id-ID")}` : '') : null,
      `Rp ${item.totalpph.toLocaleString("id-ID")}`,
      `Rp ${item.jmlditerima.toLocaleString("id-ID")}`,
      item.nm_bank,
      item.nmrek,
      item.rekening,
    ].filter(Boolean));

    // Pagination: Membagi data ke dalam beberapa halaman
    const itemsPerPage = 20;  // Atur jumlah item per halaman
    let currentPage = 1;
    let startY = 45;  // Posisi Y pertama untuk tabel

    while (currentPage <= Math.ceil(tableData.length / itemsPerPage)) {
        const pageData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        // Header Tabel
        if (currentPage > 1) {
            doc.addPage(); // Menambahkan halaman baru jika ini bukan halaman pertama
        }

        // Tampilkan Header Tabel
        autoTable(doc, {
            startY: startY,
            head: [tableHeaders],
            body: pageData,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [220, 220, 220] },
            pageBreak: 'auto',  // Mengatur pemutusan halaman otomatis saat tabel melebihi batas
        });

        startY = doc.lastAutoTable.finalY + 10; // Update posisi Y untuk elemen berikutnya

        currentPage++;
    }


    // Menampilkan Total
    const totalY = startY + 10;
    doc.setFontSize(10);
    doc.text("JUMLAH TOTAL:", 14, totalY);
    const totalData = [
      showBesaranTunjangan && totalBesartunjangan > 0
      ? `Rp ${totalBesartunjangan.toLocaleString("id-ID")}`
      : '-',
      `Rp ${totalPPH.toLocaleString("id-ID")}`,
      `Rp ${totalJmlDiterima.toLocaleString("id-ID")}`
    ].filter(Boolean);
    autoTable(doc, {
      startY: totalY + 5,
      head: [["Besaran Tunjangan", "PPH", "Jumlah Bersih"].filter(Boolean)],
      body: [totalData],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [220, 220, 220] },
    });

    // Tanda Tangan
    const signY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Mengetahui,", 14, signY);
    doc.text("Kuasa Pengguna Anggaran,", 14, signY + 6);
    doc.text(selectedRektor || "Belum Dipilih", 14, signY + 30);
    doc.text(`NIP: ${selectedNIPREKTOR || "Belum Dipilih"}`, 14, signY + 36);

    const marginRight = 20;
    doc.text("Pejabat Pembuat Komitmen,", pageWidth - marginRight, signY + 6, { align: "right" });
    doc.text(selectedPejabat || "Belum Dipilih", pageWidth - marginRight, signY + 30, { align: "right" });
    doc.text(`NIP: ${selectedNIP || "Belum Dipilih"}`, pageWidth - marginRight, signY + 36, { align: "right" });

    doc.save(`Tunjangan_${kdtunjangan}.pdf`);
};
  
  return (
    <div className="flex flex-col p-6">
      <h2 className="text-center font-bold text-lg mb-2 text-black">
        DAFTAR PERHITUNGAN PEMBAYARAN <br /> TUNJANGAN {tanggalTunjangan.length > 0 ? tanggalTunjangan[0].jenisTunjangan : ""}
      </h2>
      <p className="text-center text-sm mb-4 text-black">
      {tanggalTunjangan.length > 0
        ? `Sesuai SK No.${' '.repeat(13)}/UN18/KP/${' '.repeat(3)} Tanggal ${formatTanggal(tanggalTunjangan[0].tanggal)}`
        : `Sesuai SK No.${' '.repeat(13)}/UN18/KP/${' '.repeat(3)} Tanggal -`}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-500 shadow-md">
          <thead>
            <tr className="bg-gray-200 text-black text-sm uppercase">
              {[
                "Kode Anak",
                "Kode Tunjangan",
                "NIP",
                "Nama Pegawai",
                "Gol",
                showBesaranTunjangan ? "Besaran Tunjangan" : null,
                "PPH",
                "Jumlah Bersih",
                "Nama Bank",
                "Nama Rekening",
                "No. Rekening",
              ]
              .filter(Boolean)
              .map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-500 px-3 py-2 text-center font-semibold"
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
                  {item.kdanak}
                </td>
                <td className="border border-gray-400 px-3 py-2">{item.kdtunjangan}</td>
                <td className="border border-gray-400 px-3 py-2">{item.nip}</td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nmpeg}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                {angkaKeRomawi(Number(item.kdgol))}
                </td>
                {showBesaranTunjangan && (
                  <td className="border border-gray-400 px-3 py-2">Rp {item.besartunjangan.toLocaleString("id-ID")}</td>
                )}
                <td className="border border-gray-400 px-3 py-2">
                  Rp {item.totalpph.toLocaleString("id-ID")}
                </td>

                <td className="border border-gray-400 px-3 py-2">
                  Rp {item.jmlditerima.toLocaleString("id-ID")}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nm_bank}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.nmrek}
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  {item.rekening}
                </td>
              </tr>
            ))}

            {/* Row Total */}
            <tr className="font-bold bg-gray-300">
              <td
                className="border border-gray-500 px-3 py-2 text-center"
                colSpan={5}
              >
                JUMLAH
              </td>
              {showBesaranTunjangan && (
                <td className="border border-gray-500 px-3 py-2 text-center">
                  Rp {totalBesartunjangan.toLocaleString("id-ID")}
                </td>
              )}
              <td className="border border-gray-500 px-3 py-2 text-center">
                Rp {totalPPH.toLocaleString("id-ID")}
              </td>

              <td className="border border-gray-500 px-3 py-2 text-center">
                Rp {totalJmlDiterima.toLocaleString("id-ID")}
              </td>
              <td className="border border-gray-500 px-3 py-2" colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bagian Tanda Tangan */}
      <div className="text-left mt-6 text-black font-sans">
        <p>Mengetahui,</p>
        <div className="flex justify-between mt-2">
          {/* Kuasa Pengguna Anggaran - Kiri */}
          <div className="text-left">
            <p>Kuasa Pengguna Anggaran,</p>
            <div className="h-20"></div>
            <p className="font-bold mt-2">{selectedRektor || "Belum Dipilih"}</p>
            <p className="font-bold mt-2">NIP: {selectedNIPREKTOR || "Belum Dipilih"}</p>
            <p> </p>
            <select
              className="border border-gray-400 px-3 py-2 rounded-md"
              value={selectedRektor}
              onChange={(e) => {
                const selectedNip = e.target.value;
                const rektor = rektorList.find((p) => p.nip === selectedNip);
                
                if (rektor) {
                  setSelectedRektor(rektor.nmpeg);
                  setSelectedNIPREKTOR(rektor.nip);
                }
              }}
            >
              <option value="">Pilih Rektor</option>
              {rektorList.map((rektor) => (
                <option key={rektor.nip} value={rektor.nip}>
                  {rektor.nmpeg} ({rektor.nip})
                </option>
              ))}
            </select>
          </div>

          {/* Pejabat Pembuat Komitmen - Kanan */}
          <div className="text-right">
            <p>Pejabat Pembuat Komitmen,</p>
            <div className="h-20"></div>
            <p className="font-bold mt-2">{selectedPejabat || "Belum Dipilih"}</p>
            <p className="font-bold mt-2">NIP: {selectedNIP || "Belum Dipilih"}</p>
            <p> </p>
            <select
              className="border border-gray-400 px-3 py-2 rounded-md"
              value={selectedPejabat}
              onChange={(e) => {
                const selectedNip = e.target.value;
                const pejabat = pejabatList.find((p) => p.nip === selectedNip);
                
                if (pejabat) {
                  setSelectedPejabat(pejabat.nmpeg);
                  setSelectedNIP(pejabat.nip);
                }
              }}
            >
              <option value="">Pilih Pejabat</option>
              {pejabatList.map((pejabat) => (
                <option key={pejabat.nip} value={pejabat.nip}>
                  {pejabat.nmpeg} ({pejabat.nip})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 gap-4">
        <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Export ke Excel
        </button>
        <button onClick={exportToPDF} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Export ke PDF
        </button>
      </div>
    </div>
  );
}
