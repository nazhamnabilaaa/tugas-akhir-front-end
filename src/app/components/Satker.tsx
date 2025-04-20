import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxios from "../useAxios";
import { useRouter } from "next/navigation";
// import { AxiosError } from "axios"; // Import AxiosError

interface KonfigurasiSatkerData {
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
  kdpos: string;
  alamat: string;
}

interface AddKonfigurasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: KonfigurasiSatkerData) => void;
  initialData?: KonfigurasiSatkerData | null;
}

const AddKonfigurasiModal: React.FC<AddKonfigurasiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const defaultFormData: KonfigurasiSatkerData = {
    kdsatker: "",
    nmsatker: "",
    kdkppn: "",
    nmkppn: "",
    email: "",
    notelp: "",
    npwp: "",
    nmppk: "",
    kota: "",
    provinsi: "",
    kdpos: "",
    alamat: "",
  };

  const [formData, setFormData] = useState<KonfigurasiSatkerData>(defaultFormData);
  const axiosInstance = useAxios();
  const router = useRouter();

  const apiUrl = "http://localhost:8080";

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi: Pastikan field yang wajib diisi
    if (!formData.kdsatker || !formData.nmsatker) {
      Swal.fire("Error", "Kode dan Nama Satker wajib diisi!", "error");
      return;
    }

    const isUpdate = !!initialData; // Jika ada initialData berarti Update
    const confirmation = await Swal.fire({
      title: isUpdate ? "Update Data?" : "Simpan Data?",
      text: isUpdate
        ? "Apakah Anda yakin ingin memperbarui data ini?"
        : "Apakah Anda yakin ingin menyimpan Data Satuan Kerja ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isUpdate ? "Ya, Update!" : "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const token = localStorage.getItem("token") || "";
      let response;

      if (isUpdate) {
        if (!initialData?.kdsatker) {
          Swal.fire("Error", "Data tidak valid untuk update!", "error");
          return;
        }
        // PATCH: Update data
        response = await axiosInstance.patch(
          `${apiUrl}/satkeruniv/${initialData.kdsatker}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // POST: Tambah data baru
        response = await axiosInstance.post(`${apiUrl}/satkeruniv`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire(
          "Sukses!",
          isUpdate
            ? "Data Satuan Kerja berhasil diperbarui."
            : "Data Satuan Kerja berhasil disimpan.",
          "success"
        );

        onSave(formData);
        onClose();
        router.push("/admin/setting/konfigurasi-satker");
      } else {
        Swal.fire("Gagal!", "Gagal menyimpan data, coba lagi nanti.", "error");
      }
    } catch (error: AxiosError) { // Menambahkan tipe AxiosError
      console.error("Error:", error.response?.data || error.message);

      if (error.response?.status === 400 && error.response?.data?.msg?.includes("duplicate")) {
        Swal.fire("Error", "Data dengan kode satker ini sudah ada!", "error");
      } else {
        Swal.fire("Error", error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.", "error");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-4xl mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {initialData ? "Edit" : "Tambah"} Konfigurasi Satker
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Kode Satker
              </label>
              <input
                type="text"
                name="kdsatker"
                value={formData.kdsatker}
                onChange={(e) =>
                  setFormData( { ...formData, kdsatker: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Satker
              </label>
              <input
                type="text"
                name="nmsatker"
                value={formData.nmsatker}
                onChange={(e) =>
                  setFormData({ ...formData, nmsatker: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Kode KPPN
              </label>
              <input
                type="text"
                name="kdkppn"
                maxLength={3}
                value={formData.kdkppn}
                onChange={(e) =>
                  setFormData({ ...formData, kdkppn: e.target.value })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nama KPPN
              </label>
              <input
                type="text"
                name="nmkppn"
                value={formData.nmkppn}
                onChange={(e) =>
                  setFormData({ ...formData, nmkppn: e.target.value })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sejajarkan Email, Nomor Telepon, NPWP */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  name="notelp"
                  maxLength={15}
                  value={formData.notelp}
                  onChange={(e) =>
                    setFormData({ ...formData, notelp: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">NPWP</label>
                <input
                  type="text"
                  name="npwp"
                  maxLength={16}
                  value={formData.npwp}
                  onChange={(e) =>
                    setFormData({ ...formData, npwp: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nama PPK</label>
              <input
                type="text"
                name="nmppk"
                value={formData.nmppk}
                onChange={(e) =>
                  setFormData({ ...formData, nmppk: e.target.value })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sejajarkan Kota, Provinsi, Kode Pos */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Kota</label>
                <input
                  type="text"
                  name="kota"
                  value={formData.kota}
                  onChange={(e) =>
                    setFormData({ ...formData, kota: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={(e) =>
                    setFormData({ ...formData, provinsi: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="kdpos"
                  maxLength={5}
                  value={formData.kdpos}
                  onChange={(e) =>
                    setFormData({ ...formData, kdpos: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#FFB84C] text-white rounded hover:bg-[#FFA82C] transition-colors"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0066CC] text-white rounded hover:bg-blue-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKonfigurasiModal;
