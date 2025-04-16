import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import useAxios from "../useAxios";
import {useParams, useRouter } from "next/navigation";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    namalengkap: string;
    nip: string;
    username: string;
    email: string;
    alamat: string;
    notelp: string;
    role: string;
  };
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  formData,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxios();
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid ?? ""; 
  const [token, setToken] = useState("");
  const [UUID, setUUID] = useState("");
  const apiUrl = "http://localhost:8080";
  const [localFormData, setLocalFormData] = useState(formData);

  useEffect(() => {
    if (isOpen) {
      setLocalFormData(formData);
    }
  }, [formData, isOpen]);

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
            setUUID(decoded.UUID);
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          router.push("/");
        }
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmation = await Swal.fire({
      title: "Simpan Data?",
      text: "Apakah Anda yakin ingin Meng-update data Profile ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirmation.isConfirmed) return;
  
    // Pastikan semua field terisi
    if (
      !formData.username ||
      !formData.namalengkap ||
      !formData.email ||
      !formData.nip ||
      !formData.alamat ||
      !formData.notelp ||
      !formData.role
    ) {
      Swal.fire("Error", "Harap lengkapi semua Form!", "error");
      return;
    }
  
    try {
      const data = {
        username: formData.username,
        namalengkap: formData.namalengkap,
        email: formData.email,
        nip: formData.nip,
        alamat: formData.alamat,
        notelp: formData.notelp,
        role: formData.role,
      };
  
      const response = await axiosInstance.patch(`${apiUrl}/userUpdateProfile/${uuid}`, localFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        Swal.fire("Data berhasil di Update!", "", "success").then(() => {
          window.location.reload();
      });
      } else {
        Swal.fire("Gagal menyimpan data!", "Coba lagi nanti.", "error");
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data!", "error");
    }
  };


  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-xl mx-4 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">EDIT PROFIL PENGGUNA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nama", name: "namalengkap", type: "text" },
            { label: "NIP", name: "nip", type: "text" },
            { label: "Username", name: "username", type: "text" },
            { label: "No Telepon", name: "notelp", type: "tel" },
            { label: "Email", name: "email", type: "email" },
            { label: "Alamat", name: "alamat", type: "text" },
            { label: "Role", name: "role", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={localFormData[name] || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 mt-6">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
