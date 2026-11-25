# Finmate

Finmate adalah aplikasi pengelolaan keuangan pribadi berbasis React, TypeScript, dan Vite.

## Penyimpanan data

Finmate menggunakan IndexedDB pada browser. Transaksi, anggaran, dan preferensi disimpan pada perangkat pengguna masing-masing. Tidak ada database online atau sinkronisasi ant perangkat.

Data dapat diekspor menjadi file JSON melalui menu Settings, lalu dipulihkan menggunakan fitur Import backup. Jika pengguna menghapus data browser atau berpindah perangkat tanpa membuat cadangan, data lokal dapat hilang.

## Menjalankan di komputer

1. Install Node.js versi LTS.
2. Buka folder proyek di Visual Studio Code.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`.
5. Buka alamat lokal yang ditampilkan Vite.

## Deploy ke GitHub Pages

1. Buat repository GitHub untuk proyek ini.
2. Push seluruh file proyek ke branch `main`.
3. Buka repository, pilih **Settings > Pages**.
4. Pada bagian **Build and deployment**, pilih **GitHub Actions**.
5. Push commit ke branch `main`. Workflow `.github/workflows/deploy.yml` akan membangun dan menerbitkan aplikasi.

Konfigurasi Vite membaca nama repository secara otomatis saat proses GitHub Actions.

## Fitur

- Dashboard dengan kondisi awal kosong.
- Pencatatan, pengubahan, dan penghapusan transaksi.
- Pengelolaan anggaran.
- Laporan dan grafik dari transaksi pengguna.
- AI Insights berbasis aturan sederhana, bukan model AI eksternal.
- Simulasi input transaksi melalui WhatsApp, belum terhubung ke WhatsApp Business API.
- Split Bill.
- Preferensi mata uang dan tema.
- Penyimpanan lokal menggunakan IndexedDB.
- Backup dan restore data dalam format JSON.
- Ekspor transaksi dan laporan ke CSV.

## Batasan penting

Finmate tidak menyediakan akun online, autentikasi server, atau sinkronisasi cloud. Profil lokal hanya untuk tampilan. Data tersimpan pada browser dan profil perangkat yang digunakan. Jangan gunakan aplikasi ini untuk menyimpan kata sandi bank, PIN, atau kredensial keuangan.
