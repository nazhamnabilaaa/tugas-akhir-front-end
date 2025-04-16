import React, { useEffect, useState } from "react";

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
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Employee) => void;
  initialData: Employee;
}

const labelMap: { [key: string]: string } = {
  nmpeg: "Nama Pegawai",
  nip: "NIP",
  kdjab: "Kode Jabatan",
  kdkawin: "Kode Kawin",
  gaji_bersih: "Gaji Bersih",
  nogaji: "No Gaji",
  bulan: "Bulan",
  tahun: "Tahun",
  kdgol: "Kode Golongan",
  kdduduk: "Kode Duduk",
  npwp: "NPWP",
  nmrek: "Nama Rekening",
  nm_bank: "Nama Bank",
  rekening: "Rekening",
  kdbankspan: "Kode Bank SPAN",
  nmbankspan: "Nama Bank SPAN",
  kdnegara: "Kode Negara",
  kdkppn: "Kode KPPN",
  kdpos: "Kode Pos",
  gjpokok: "Gaji Pokok",
  kdgapok: "Kode Gaji Pokok",
  bpjs: "BPJS",
  kdanak: "Kode Anak",
  kdsubanak: "Kode Sub anak",
};

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Employee>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Data Pegawai</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {labelMap[key] || key.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={key}
                value={(formData as any)[key]}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}

          <div className="col-span-2 flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-400 text-white rounded"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
