export interface TunjanganProfesi {
  kodeSatker: string;
  namaSatker: string;
  kodeAnak: string;
  namaAnak: string;
  tanggal: string;
  keterangan: string;
  penerima: Penerima[];
}

export interface Penerima {
  nip: string;
  nama: string;
  golongan: string;
  gajiPokok: number;
  pph: number;
  jumlahDiterima: number;
  isSelected?: boolean;
}
