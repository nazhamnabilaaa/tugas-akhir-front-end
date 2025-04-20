"use client";

import React, { useState, useEffect, useRef } from "react";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import {useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

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


interface Rektor {
  kdsatker: string;
  nmsatker: string;
  nik: string;
  nip: string;
  nmpeg: string;
  gelarRektor: string;
}

interface KonfigurasiSatker {
  kdsatker: string;
  nmsatker: string;
  kdkppn: string;
  nmkppn: string;
  email: string;
  notelp: string;
  npwp: string;
  nmppk: string;
  kota: string;
  provinsi: string;
  alamat: string;
}


export default function UniversityLetter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const kdtunjangan = params.kdtunjangan ?? ""; 

  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSatker[]>([]);
  const [selectedRektor, setSelectedRektor] = useState<string>(""); 
  const [selectedSatker, setSelectedSatker] = useState<KonfigurasiSatker | null>(null);
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
  const componentRef = useRef<HTMLDivElement>(null);
  const pdf = new jsPDF("p", "mm", "a4");
  

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
  
    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/satkeruniv`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Ambil hanya data yang bisa di-map
        setKonfigurasi(response.data.Data[0] || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        localStorage.removeItem("accessToken");
        router.push("/");
        setError("Gagal mengambil data Satuan Kerja Universitas");
      } finally {
        setLoading(false);
      }
    };
  
    getSatker();
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


  const handleExportPDF = async () => {
    const input = componentRef.current;
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
  
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width; // padding 10mm kiri kanan
  
      const marginX = 10; // margin kiri-kanan
      const marginY = 10; // margin atas-bawah
  
      pdf.addImage(imgData, "PNG", marginX, marginY, pdfWidth - 2 * marginX, pdfHeight);
      pdf.save("surat-pertanggungjawaban.pdf");
    }
  };
  

  function terbilang(n: number): string {
    const satuan = [
      "", "satu", "dua", "tiga", "empat", "lima",
      "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"
    ];
  
    const toWords = (x: number): string => {
      if (x < 12) return satuan[x];
      if (x < 20) return toWords(x - 10) + " belas";
      if (x < 100) return toWords(Math.floor(x / 10)) + " puluh " + toWords(x % 10);
      if (x < 200) return "seratus " + toWords(x - 100);
      if (x < 1000) return toWords(Math.floor(x / 100)) + " ratus " + toWords(x % 100);
      if (x < 2000) return "seribu " + toWords(x - 1000);
      if (x < 1_000_000) return toWords(Math.floor(x / 1000)) + " ribu " + toWords(x % 1000);
      if (x < 1_000_000_000) return toWords(Math.floor(x / 1_000_000)) + " juta " + toWords(x % 1_000_000);
      if (x < 1_000_000_000_000) return toWords(Math.floor(x / 1_000_000_000)) + " milyar " + toWords(x % 1_000_000_000);
      return "Angka terlalu besar";
    };
  
    const hasil = toWords(n).replace(/\s+/g, " ").trim();
    return hasil.charAt(0).toUpperCase() + hasil.slice(1); // Kapital awal
  }

  return (
<div className="max-w-3xl mx-auto bg-white p-8 font-sans border border-gray-300 shadow-lg">

  {/* Filter + Tombol Export */}
<div className="mb-6 flex flex-wrap items-end justify-between gap-y-4">
  <div className="flex gap-x-6 flex-wrap">
    
    {/* Dropdown Satuan Kerja */}
    <div>
      <label htmlFor="satker-select" className="block font-semibold mb-1">Pilih Satuan Kerja:</label>
      <select
        id="satker-select"
        onChange={(e) => {
          const satker = konfigurasi.find((item) => item.kdsatker === e.target.value);
          setSelectedSatker(satker || null);
        }}
        className="w-64 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">-- Pilih Satuan Kerja --</option>
        {konfigurasi.map((satker) => (
          <option key={satker.kdsatker} value={satker.kdsatker}>
            {satker.kdsatker}
          </option>
        ))}
      </select>
    </div>

    {/* Dropdown Rektor */}
    <div>
      <label htmlFor="rektor-select" className="block font-semibold mb-1">Pilih Rektor:</label>
      <select
        id="rektor-select"
        value={selectedRektor}
        onChange={(e) => setSelectedRektor(e.target.value)}
        className="w-64 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">-- Pilih Rektor --</option>
        {rektorList.map((rektor) => (
          <option key={rektor.nip} value={rektor.nmpeg}>
            {rektor.nmpeg}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Kanan: Tombol Export */}
  <div>
    <button
      onClick={handleExportPDF}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Export PDF
    </button>
  </div>
</div>

    
  {/* Area yang di-export */}
  <div
    ref={componentRef}
    id="print-area"
    className="p-10 bg-white"
    style={{ width: "auto", minHeight: "auto", boxSizing: "border-box" }}
  >
    {/* Header */}
    <div className="flex items-center mb-4">
      <div className="w-20 h-20 relative mr-4">
        <Image
          src="/assets/img/logo/logo-unram.png"
          alt="Logo Universitas Mataram"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <div className="text-center flex-1 text-black">
        <p className="text-xs font-semibold uppercase">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</p>
        <h1 className="text-xl font-bold my-1">{selectedSatker?.nmsatker}</h1>
        <p className="text-xs">
          {selectedSatker ? `${selectedSatker.alamat} Telp. ${selectedSatker.notelp}` : ""}
        </p>
      </div>
    </div>

    {/* Garis Pemisah */}
    <div className="border-t-2 border-black mb-6"></div>

    {/* Judul Surat */}
    <div className="text-center mb-6 text-black">
      <h2 className="text-lg font-bold uppercase">Surat Pernyataan Tanggung Jawab Mutlak</h2>
    </div>

    {/* Informasi Pribadi */}
    <div className="mb-6 space-y-2 text-black">
      <div className="flex">
        <div className="w-32 font-semibold">Nama</div>
        <div className="w-4">:</div>
        <div className="flex-1">{selectedRektor || "-"}</div>
      </div>
      <div className="flex">
        <div className="w-32 font-semibold">NIP</div>
        <div className="w-4">:</div>
        <div className="flex-1">{rektorList.find((r) => r.nmpeg === selectedRektor)?.nip || "-"}</div>
      </div>
      <div className="flex">
        <div className="w-32 font-semibold">Jabatan</div>
        <div className="w-4">:</div>
        <div className="flex-1">Rektor Sebagai Kuasa Pengguna Anggaran</div>
      </div>
    </div>

    {/* Isi Surat */}
    <div className="mb-6 text-black space-y-4">
      <p>Menyatakan dengan sesungguhnya bahwa:</p>
      <ol className="list-decimal pl-6 space-y-4">
        <li className="text-justify">
          Kami bertanggung jawab sepenuhnya terhadap perhitungan pada Daftar Perhitungan Pembayaran Tunjangan Kehormatan Profesor Bulan Oktober Tahun 2024 bagi Dosen pada Satuan Kerja Universitas Mataram sebesar{" "}
          <strong>Rp. {totalJmlDiterima.toLocaleString("id-ID")},-</strong>{" "}
          <span className="italic">({terbilang(totalJmlDiterima).toLowerCase()} rupiah)</span>{" "}
          yang telah dihitung dengan benar sesuai ketentuan peraturan perundang-undangan.
        </li>
        <li className="text-justify">
          Apabila di kemudian hari terdapat kelebihan pembayaran atau kerugian negara atas pembayaran Tunjangan Kehormatan Profesor tersebut, kami bersedia untuk menyetor kelebihan pembayaran / kerugian negara tersebut ke Rekening Kas Negara.
        </li>
      </ol>
    </div>

    {/* Penutup */}
    <p className="mb-12 text-black">Demikian pernyataan ini kami buat dengan sebenar-benarnya.</p>

    {/* Tanda Tangan */}
    <div className="text-right pr-21 text-black">
      <p>Mataram, 23 Oktober 2024</p>
      <p>Kuasa Pengguna Anggaran,</p>
      <div className="h-24"></div>
      <p className="font-bold">{selectedRektor || "-"}</p>
      <p>NIP. {rektorList.find((r) => r.nmpeg === selectedRektor)?.nip || "-"}</p>
    </div>
  </div>
</div>
  );
}
