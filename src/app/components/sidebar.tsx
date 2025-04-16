"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MdDomainAdd, MdOutlineNoteAdd } from "react-icons/md";
import { BsPersonAdd } from "react-icons/bs";
import { TbFileDescription, TbFileMinus } from "react-icons/tb";

const Sidebar = () => {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const toggleSettings = () => setSettingsOpen(!settingsOpen);
  const togglePayment = () => setPaymentOpen(!paymentOpen);

  return (
    <div className="bg-[#EDEDED] text-black w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {/* Dashboard Menu */}
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 hover:text-[#004AAD] ${
                pathname === "/admin/dashboard"
                  ? "bg-gray-200 text-[#004AAD]"
                  : ""
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Settings Dropdown */}
          <li>
            <div
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                settingsOpen ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              onClick={toggleSettings}
            >
              <Settings size={20} />
              <span className="hover:text-[#004AAD]">Settings</span>
              {settingsOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {settingsOpen && (
              <ul className="ml-6 space-y-2 mt-2">
                <li>
                  <Link
                    href="/admin/setting/konfigurasi-satker"
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 active:bg-gray-300 hover:text-[#004AAD] ${
                      pathname === "/admin/setting/konfigurasi-satker"
                        ? "bg-gray-200 text-[#004AAD]"
                        : ""
                    }`}
                  >
                    <MdDomainAdd size={20} />
                    <span>Konfigurasi Satker</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/setting/konfigurasi-anak-satker"
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 active:bg-gray-300 hover:text-[#004AAD] ${
                      pathname === "/admin/setting/konfigurasi-anak-satker"
                        ? "bg-gray-200 text-[#004AAD]"
                        : ""
                    }`}
                  >
                    <MdOutlineNoteAdd size={20} />
                    <span>Konfigurasi Anak Satker</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/setting/setting-pejabat"
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 active:bg-gray-300 hover:text-[#004AAD] ${
                      pathname === "/admin/setting/setting-pejabat"
                        ? "bg-gray-200 text-[#004AAD]"
                        : ""
                    }`}
                  >
                    <BsPersonAdd size={20} />
                    <span>Setting Pejabat</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Data Dosen Menu */}
          <li>
            <Link
              href="/admin/data-dosen/restore"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 hover:text-[#004AAD] ${
                pathname === "/admin/data-dosen/dosen"
                  ? "bg-gray-200 text-[#004AAD]"
                  : ""
              }`}
            >
              <Users size={20} />
              <span>Data Dosen</span>
            </Link>
          </li>

          {/* Pembayaran Dropdown */}
          <li>
            <div
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                paymentOpen ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              onClick={togglePayment}
            >
              <CreditCard size={20} />
              <span className="hover:text-[#004AAD]">Pembayaran</span>
              {paymentOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {paymentOpen && (
              <ul className="ml-6 space-y-2 mt-2">
                <li>
                  <Link
                    href="/admin/pembayaran/tunjangan-profesi"
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 active:bg-gray-300 hover:text-[#004AAD] ${
                      pathname === "/admin/pembayaran/tunjangan-profesi"
                        ? "bg-gray-200 text-[#004AAD]"
                        : ""
                    }`}
                  >
                    <TbFileMinus size={20} />
                    <span>Tunjangan Profesi</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pembayaran/tunjangan-kehormatan"
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 active:bg-gray-300 hover:text-[#004AAD] ${
                      pathname === "/admin/pembayaran/tunjangan-kehormatan"
                        ? "bg-gray-200 text-[#004AAD]"
                        : ""
                    }`}
                  >
                    <TbFileDescription size={20} />
                    <span>Tunjangan Kehormatan</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Export File Menu */}
          <li>
            <Link
              href="/admin/export-file"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 hover:text-[#004AAD] ${
                pathname === "/admin/export-file"
                  ? "bg-gray-200 text-[#004AAD]"
                  : ""
              }`}
            >
              <FileText size={20} />
              <span>Export File</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
