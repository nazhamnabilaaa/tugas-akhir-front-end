"use client";

import React, { useState, useEffect, useRef } from "react";
import useAxios from "../../useAxios";
import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [selectedRektor, setSelectedRektor] = useState<string>("");
  const [selectedSatker, setSelectedSatker] = useState<KonfigurasiSatker | null>(null);
  const [rektorList, setRektorList] = useState<Rektor[]>([]);
  const [listTunjangan, setListTunjangan] = useState<listTunjanganPegawai[]>([]);
  const [totalJmlDiterima, setTotalJmlDiterima] = useState(0);
  const axiosInstance = useAxios();
  const router = useRouter();
  const componentRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const kdtunjangan = params.kdtunjangan ?? ""; 

  const apiUrl = "http://localhost:8080";

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/");
    } else {
      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("accessToken");
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (!kdtunjangan) return;

    const getListTunjangan = async () => {
      try {
        const response1 = await axiosInstance.get(`${apiUrl}/tunjangankehormatan`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        const response2 = await axiosInstance.get(`${apiUrl}/tunjanganprofesi`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const data = [...response1.data.Data, ...response2.data.Data];
        const filteredData = data.flatMap((item) => {
          if (Array.isArray(item)) {
            return item.filter((innerItem) => innerItem.kdtunjangan === kdtunjangan);
          }
          return [];
        });

        setListTunjangan(filteredData);

        const totalJml = filteredData.reduce((sum, item) => sum + item.jmlditerima, 0);
        setTotalJmlDiterima(totalJml);
      } catch {
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    getListTunjangan();
  }, [kdtunjangan, axiosInstance, router]);

  useEffect(() => {
    const getSatker = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/satkeruniv`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setKonfigurasi(response.data.Data[0] || []);
      } catch {
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    getSatker();
  }, [router, axiosInstance]);

  useEffect(() => {
    const getRektor = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/rektor`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setRektorList(response.data.Data[0] || []);
      } catch {
        localStorage.removeItem("accessToken");
        router.push("/");
      }
    };

    getRektor();
  }, [router, axiosInstance]);

  const handleExportPDF = async () => {
    const input = componentRef.current;
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

      const marginX = 10; 
      const marginY = 10; 

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

    return toWords(n).replace(/\s+/g, " ").trim();
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 font-sans border border-gray-300 shadow-lg">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-y-4">
        <div className="flex gap-x-6 flex-wrap">
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
                <option key={rektor.nip} value={rektor.nip}>
                  {rektor.nmpeg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="text-right mb-4">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Export PDF
        </button>
      </div>
      <div ref={componentRef} className="px-4 py-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Surat Pertanggungjawaban</h2>
        <div className="mb-4">
          <p>Satuan Kerja: {selectedSatker?.nmsatker}</p>
          <p>Rektor: {selectedRektor}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Data Pegawai dan Tunjangan</h3>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nama Pegawai</th>
                <th className="px-4 py-2 border">Jumlah Tunjangan</th>
                <th className="px-4 py-2 border">PPH</th>
                <th className="px-4 py-2 border">Total Diterima</th>
              </tr>
            </thead>
            <tbody>
              {listTunjangan.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{item.nmpeg}</td>
                  <td className="px-4 py-2 border">{item.besartunjangan}</td>
                  <td className="px-4 py-2 border">{item.totalpph}</td>
                  <td className="px-4 py-2 border">{item.jmlditerima}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <p>Total Jumlah Diterima: {totalJmlDiterima}</p>
          <p>Terbilang: {terbilang(totalJmlDiterima)}</p>
        </div>
      </div>
    </div>
  );
}
