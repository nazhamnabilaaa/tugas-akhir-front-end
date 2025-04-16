"use client";

import React from "react";

export default function SSPForm() {
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md border border-gray-400">
      {/* Header */}
      <div className="text-center font-bold text-lg border-b pb-2 mb-4">
        <p>KEMENTERIAN KEUANGAN R.I.</p>
        <p>DIREKTORAT JENDERAL PAJAK</p>
        <h2 className="text-xl">SURAT SETORAN PAJAK (SSP)</h2>
      </div>

      <div className="flex justify-between mb-2">
        <p>NPWP: 00.173.491.2-911.000</p>
        <p className="border px-2">LEMBAR 1</p>
      </div>
      <p className="font-bold">NAMA WP: UNIVERSITAS MATARAM</p>
      <p>ALAMAT WP: Jl. Majapahit No.62 Mataram</p>

      <div className="border border-gray-500 mt-4">
        <div className="p-2 border-b">
          <p>
            <strong>Kode Akun Pajak:</strong> 411121
          </p>
          <p>
            <strong>Kode Jenis Setoran:</strong> 100
          </p>
        </div>
        <div className="p-2 border-b">
          <p>
            Uraian Pembayaran: PPh Pasal 21, Pembayaran Tunjangan Profesi Dosen
            PPPK Bulan Januari 2025 Fakultas Teknik Unram
          </p>
        </div>
        <div className="p-2 border-b flex justify-between">
          <p>Masa Pajak: Januari</p>
          <p>Tahun Pajak: 2025</p>
        </div>
      </div>

      <div className="mt-4">
        <p>
          <strong>Jumlah Pembayaran:</strong> Rp 333.910
        </p>
        <p>
          <strong>Terbilang:</strong> Tiga Ratus Tiga Puluh Tiga Ribu Sembilan
          Ratus Sepuluh Rupiah
        </p>
      </div>

      <div className="flex justify-between mt-6">
        <div className="text-center">
          <p>Diterima oleh Kantor Penerima Pembayaran</p>
          <p>Tanggal: ...................</p>
        </div>
        <div className="text-center">
          <p>Wajib Pajak/Penyetor</p>
          <p>Mataram, tanggal 6 Januari 2025</p>
          <p className="font-bold">Nurfardiati, SE</p>
        </div>
      </div>

      <p className="text-center text-sm mt-4">
        * Terima Kasih Telah Membayar Pajak - Pajak Untuk Pembangunan Bangsa *
      </p>
    </div>
  );
}
