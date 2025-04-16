import type React from "react";
import { useState } from "react";

interface Employee {
  nmpeg: string;
  nip: string;
  kdjab: string;
  kdkawin: string;
  gaji_bersih: string;
  nogaji: string;
  bulan: string;
  tahun: string;
  kdgol: string;
  kdduduk: string;
  npwp: string;
  nmrek: string;
  nm_bank: string;
  rekening: string;
  kdbankspan: string;
  nmbankspan: string;
  kdnegara: string;
  kdkppn: string;
  kdpos: string;
  gjpokok: string;
  kdgapok: string;
  bpjs: string;
  kdanak: string;
  kdsubanak: string;
  KodeUpload: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEmployee: Employee) => void;
}

const initialEmployeeData: Employee = {
  nmpeg: "",
  nip: "",
  kdjab: "",
  kdkawin: "",
  gaji_bersih: "",
  nogaji: "",
  bulan: "",
  tahun: "",
  kdgol: "",
  kdduduk: "",
  npwp: "",
  nmrek: "",
  nm_bank: "",
  rekening: "",
  kdbankspan: "",
  nmbankspan: "",
  kdnegara: "",
  kdkppn: "",
  kdpos: "",
  gjpokok: "",
  kdgapok: "",
  bpjs: "",
  kdanak: "",
  kdsubanak: "",
  KodeUpload: "",
};

const labelMap: { [key: string]: string } = {
  nmpeg: "Nama Pegawai",
  nip: "NIP",
  kdjab: "Kode Jabatan",
  kdkawin: "Kode Kawin",
  gaji_bersih: "Gaji Bersih",
  nogaji: "Nomor Gaji",
  bulan: "Bulan",
  tahun: "Tahun",
  kdgol: "Kode Golongan",
  kdduduk: "Kode Kedudukan",
  npwp: "NPWP",
  nmrek: "Nama Rekening",
  nm_bank: "Nama Bank",
  rekening: "Nomor Rekening",
  kdbankspan: "Kode Bank Span",
  nmbankspan: "Nama Bank Span",
  kdnegara: "Kode Negara",
  kdkppn: "Kode KPPN",
  kdpos: "Kode Pos",
  gjpokok: "Gaji Pokok",
  kdgapok: "Kode Gaji Pokok",
  bpjs: "BPJS",
  kdanak: "Kode Anak",
  kdsubanak: "Kode Sub Anak",
  KodeUpload: "Kode Upload",
};

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSave,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>(initialEmployeeData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData(initialEmployeeData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-[800px] min-w-[700px] w-full max-h-[90vh] overflow-y-auto z-50">
        <h2 className="text-2xl font-bold mb-4">Tambah Data Pegawai</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium mb-1 capitalize"
              >
                {labelMap[key as keyof Employee] || key.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                id={key}
                name={key}
                value={formData[key as keyof Employee]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="col-span-2 flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
