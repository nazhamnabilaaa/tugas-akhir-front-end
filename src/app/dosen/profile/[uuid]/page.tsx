"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import EditProfileModal from "@/components/EditProfileModal";
import useAxios from "../../../useAxios";
import { jwtDecode } from "jwt-decode";
import {useParams, useRouter } from "next/navigation";

interface Users {
  uuid: string;
  username: string;
  namalengkap: string;
  email: string;
  nip: string;
  notelp: string;
  alamat: string;
  role: string;
} 

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setLoading] = useState(true);
  const [setError] = useState<string | null>(null);
  const axiosInstance = useAxios();
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid ?? ""; 
  const [token, setToken] = useState("");
  const [setUUID] = useState("");
  const apiUrl = "http://localhost:8080";

  const [setUsers] = useState<Users[]>([]);
  const [formData, setFormData] = useState({
    uuid: "",
    username: "",
    namalengkap: "",
    email: "",
    nip: "",
    notelp: "",
    alamat: "",
    role: "",
  });

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

  useEffect(() => {
    console.log("params:", params); // Debugging params
    console.log("uuid:", uuid); // Debugging UUID
  
    if (!token || !uuid) {
      console.warn("Token atau uuid belum tersedia, menunggu...");
      return;
    }
  
    const GetUsersByUUID = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${apiUrl}/users/${uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data && response.data.Data && response.data.Data.length > 0) {
          const detailData = response.data.Data[0];
  
          setUsers(response.data.Data);
          setFormData({
            uuid: detailData.uuid || "",
            username: detailData.username || "",
            namalengkap: detailData.namalengkap || "",
            email: detailData.email || "",
            nip: detailData.nip || "",
            alamat: detailData.alamat || "",
            notelp: detailData.notelp || "",
            role: detailData.role || "",
          });
        } else {
          console.warn("Data tidak ditemukan.");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data Tanggal Kehormatan");
      } finally {
        setLoading(false);
      }
    };
  
    GetUsersByUUID();
  }, [uuid, token, axiosInstance]);


  return (
    <section className="text-black px-4 md:px-16">
      <Navbar />

      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-lg mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
          PROFIL PENGGUNA
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="w-32 h-32 md:w-48 md:h-48 relative rounded-full overflow-hidden">
            <Image
              src="/assets/img/profile/profile.png"
              alt="Profile Picture"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          {/* User Information */}
          <div className="flex-1 w-full">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center md:text-left">
              {formData.namalengkap}
            </h3>

            <div className="space-y-4">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">Nama</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.namalengkap}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">NIP</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.nip}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">USERNAME</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.username}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">Email</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.email}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">No Telepon</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.notelp}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">Alamat</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                    {formData.alamat}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 font-semibold">
                  <span className="text-base md:text-lg">Email</span>
                </div>
                <div className="flex-1">
                  <span className="text-base md:text-lg text-gray-600">
                  {formData.email ? formData.email : "Nama tidak tersedia"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center md:justify-start">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-[#FFB84C] text-white font-semibold rounded-lg hover:bg-[#FFA82C] transition duration-200"
                >
                  Edit Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
      />
    </section>
  );
}
