const routes = {
  // Halaman Utama dan Dashboard
  home: "/",
  dashboard: "/dashboard",

  // Dosen
  dosen: {
    list: "/dosen",
    add: "/dosen/add",
    edit: (id: string) => `/dosen/edit/${id}`,
    delete: (id: string) => `/dosen/delete/${id}`,
    restore: "/dosen/restore",
    pembayaran: {
      tunjanganProfesi: "/dosen/pembayaran/tunjangan-profesi",
      tambahProfesi: "/dosen/pembayaran/tambah-profesi",
      lihatProfesi: "/dosen/pembayaran/lihat-profesi",
      tunjanganKehormatan: "/dosen/pembayaran/tunjangan-kehormatan",
      tambahKehormatan: "/dosen/pembayaran/tambah-kehormatan",
      lihatKehormatan: (kdtunjangan: string) => `/dosen/pembayaran/lihat-kehormatan/${kdtunjangan}`,
    },
  },

  

  // Users (Pengguna)
  users: {
    list: "/dashboard/users",
    add: "/dashboard/users/add",
    edit: (id: string) => `/dashboard/users/edit/${id}`,
    delete: (id: string) => `/dashboard/users/delete/${id}`,
  },

  // Export File
  exportFile: {
    list: "/export-file",
    detail: (id: string) => `/export-file/${id}`,
    downloadLampiran: (id: string) => `/export-file/${id}/download/lampiran`,
    downloadADK: (id: string) => `/export-file/${id}/download/adk`,
    downloadSPM: (id: string) => `/export-file/${id}/download/spm`,
    downloadSSP: (id: string) => `/export-file/${id}/download/ssp`,
    downloadSPTJM: (id: string) => `/export-file/${id}/download/sptjm`,
  },

  // Pejabat
  pejabat: {
    list: "/pejabat",
    add: "/pejabat/add",
    edit: (id: string) => `/pejabat/edit/${id}`,
    delete: (id: string) => `/pejabat/delete/${id}`,
  },

  // Konfigurasi Satker
  konfigurasiSatker: {
    list: "/konfigurasi-satker",
    add: "/konfigurasi-satker/add",
    edit: (id: string) => `/konfigurasi-satker/edit/${id}`,
    delete: (id: string) => `/konfigurasi-satker/delete/${id}`,
    anakSatker: {
      list: "/konfigurasi-satker/anak-satker",
      add: "/konfigurasi-satker/anak-satker/add",
      edit: (id: string) => `/konfigurasi-satker/anak-satker/edit/${id}`,
      delete: (id: string) => `/konfigurasi-satker/anak-satker/delete/${id}`,
    },
  },

  // Pengaturan Akun
  pengaturanAkun: {
    settings: "/pengaturan-akun",
  },

  // Restore Data Dosen
  restoreDosen: "/dosen/restore",

  // Autentikasi Pengguna
  login: "/login",
  lupaSandi: "/lupa-sandi",

  // Profil Pengguna
  profilPengguna: "/profil-pengguna",

  // Referensi Satker
  referensiSatker: "/referensi-satker",
  referensiAnakSatker: "/referensi-anak-satker",
};

export default routes;
