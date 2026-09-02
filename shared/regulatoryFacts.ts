export const KEPDIRJEN_281 = {
  shortName: "Kepdirjen 281/2026",
  number: "281/KPTS/DK/2026",
  authority: "Direktur Jenderal Bina Konstruksi",
  title: "Penetapan Standar Skema Sertifikasi Badan Usaha Jasa Konstruksi",
  establishedDate: "26 Agustus 2026",
  legalBasis: "Pasal 5 ayat (9) Permen PU No. 6 Tahun 2025",
  framework: "PP No. 28 Tahun 2025",
  supersedes: "Kepdirjen Bina Konstruksi No. 37/KPTS/DK/2025",
  transitionDeadline: "25 Februari 2027",
  sourceLabel: "Kepdirjen Bina Konstruksi No. 281/KPTS/DK/2026",
} as const;

export const KEPDIRJEN_281_CORE_POINTS = [
  "Standar skema menjadi acuan LSBU untuk penilaian kelayakan persyaratan kualifikasi BUJK.",
  "Kriteria penilaian dipisahkan menjadi kriteria kualifikasi, kriteria subklasifikasi, dan kriteria lainnya.",
  "SBU digunakan sesuai klasifikasi, subklasifikasi, dan kualifikasi yang tercantum.",
  "Istilah PJSKBU disesuaikan menjadi PJKBU (Penanggung Jawab Klasifikasi Badan Usaha).",
  "Kriteria lainnya mencakup penerapan SMAP, keanggotaan asosiasi yang tercatat, pelaporan pemilik manfaat, laporan kegiatan usaha tahunan untuk perpanjangan, dan pengembangan usaha berkelanjutan.",
  "Pemeliharaan sertifikasi mencakup surveilans terjadwal dan tidak terjadwal serta sertifikasi ulang.",
  "Data dan dokumen harus dapat diverifikasi dengan sumber acuan dan jejak pembuktian yang jelas.",
] as const;

export const KEPDIRJEN_281_DOMAIN_POINTS = {
  sbu: [
    "Periksa kesesuaian kualifikasi, klasifikasi, dan subklasifikasi SBU.",
    "Periksa PJTBU/PJKBU, penjualan tahunan, kemampuan keuangan, serta kriteria lainnya.",
    "Pantau surveilans dan kewajiban pemeliharaan sertifikasi, bukan hanya tanggal kedaluwarsa.",
  ],
  skk: [
    "SKK tetap mengikuti ketentuan kompetensi kerja yang berlaku; Kepdirjen 281 mengaitkannya dengan pemenuhan PJTBU/PJKBU dalam skema SBU.",
    "Kesesuaian jenjang dan subklasifikasi SKK harus dinilai terhadap klasifikasi BUJK yang diajukan.",
    "Jangan menyimpulkan kelayakan SBU hanya dari kepemilikan SKK.",
  ],
  licensing: [
    "Kepdirjen 281 mengatur skema sertifikasi BUJK, bukan menggantikan proses NIB atau OSS-RBA.",
    "Perizinan perlu memeriksa konsistensi KBLI, identitas badan usaha, dan ruang lingkup SBU.",
    "Status sertifikasi dan status perizinan harus dinilai sebagai dua ranah yang berbeda.",
  ],
  tender: [
    "Verifikasi SBU terhadap persyaratan paket: status, kualifikasi, klasifikasi, dan subklasifikasi.",
    "Periksa bukti PJTBU/PJKBU dan SKK yang relevan bila dipersyaratkan dokumen pemilihan.",
    "Selama masa transisi, hindari keputusan otomatis tanpa verifikasi sumber resmi dan dokumen tender.",
  ],
  project: [
    "Simpan bukti SBU/SKK dan ruang lingkupnya sebagai bagian dari jejak kepatuhan proyek.",
    "Pantau perubahan PJTBU/PJKBU, surveilans, dan status sertifikasi selama pelaksanaan.",
    "Pisahkan data yang berasal dari dokumen proyek dari kesimpulan kepatuhan regulasi.",
  ],
} as const;

export type Kepdirjen281Domain = keyof typeof KEPDIRJEN_281_DOMAIN_POINTS;

export const KEPDIRJEN_281_AI_CONTEXT = `
RUJUKAN SERTIFIKASI BUJK TERBARU:
- Kepdirjen Bina Konstruksi No. 281/KPTS/DK/2026, ditetapkan 26 Agustus 2026, tentang Penetapan Standar Skema Sertifikasi Badan Usaha Jasa Konstruksi.
- Keputusan ini melaksanakan Pasal 5 ayat (9) Permen PU No. 6 Tahun 2025 dalam kerangka PP No. 28 Tahun 2025.
- Kepdirjen Bina Konstruksi No. 37/KPTS/DK/2025 dicabut dan dinyatakan tidak berlaku.
- LSBU diberi masa penyesuaian paling lambat 6 bulan sejak penetapan. Jangan menganggap seluruh perubahan sistem sudah berlaku operasional tanpa memeriksa pemberlakuan resmi dan kesiapan SIJK.
- Penilaian dipisahkan menjadi kriteria kualifikasi, subklasifikasi, dan kriteria lainnya.
- Gunakan istilah PJKBU (Penanggung Jawab Klasifikasi Badan Usaha), bukan PJSKBU.
- Kriteria lainnya mencakup penerapan SMAP, keanggotaan asosiasi yang tercatat, pelaporan pemilik manfaat, laporan kegiatan usaha tahunan untuk perpanjangan, dan pengembangan usaha berkelanjutan.
- Pemeliharaan SBU mencakup surveilans terjadwal/tidak terjadwal dan sertifikasi ulang.
- Untuk tender, cocokkan SBU dengan status, kualifikasi, klasifikasi, subklasifikasi, dan persyaratan paket. Jangan memberi keputusan lulus/gugur hanya berdasarkan ringkasan regulasi.
- Untuk SKK, perizinan, dan proyek, jelaskan bahwa Kepdirjen 281 mengatur skema sertifikasi BUJK dan hanya terkait sepanjang menyangkut pemenuhan atau penggunaan SBU.
- Jika rincian tidak tersedia atau penerapan transisi belum jelas, nyatakan ketidakpastian dan sarankan verifikasi ke LSBU/LPJK atau sumber resmi.
`.trim();