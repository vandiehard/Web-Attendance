# 📋 Pembagian Tugas & Tanggung Jawab Tim (Web Attendance System)

Dokumen ini memuat panduan alur kerja dan pembagian tanggung jawab untuk setiap anggota tim dalam pengembangan serta pemeliharaan project **Web Attendance System** (Tugas Besar Pemrograman Web Semester 5).

---

## 👥 Profil Anggota & Role

| No | Nama Anggota | Role / Fokus Utama | Area Kerja |
|:---:|:---|:---|:---|
| 1 | **Sarip** | **Backend & Database Engineer** | `apps/api`, `prisma/`, Docker & Storage Service |
| 2 | **Aldo** | **Frontend Core & State Engineer** | `apps/web/src`, React Router, React Query, Auth Flow |
| 3 | **Rafi** | **UI/UX, Styling & Hardware Features (Camera/GPS)** | `apps/web` (CSS, Tailwind, HTML5 Media & Geolocation) |
| 4 | **Riandra** | **QA, Security & DevOps / Git Master** | `e2e/`, Playwright, Docker, CI/CD, Git Repository & Doc |

---

## 📌 Rincian Tugas & Tanggung Jawab

### 1. 🛠️ Sarip — Backend & Database Engineer
**Fokus Utama:** Menangani arsitektur data, logika bisnis backend (NestJS), dan integrasi basis data (Prisma + MySQL).

- **Tugas Utama:**
  1. **Database & ORM Management (`prisma/`):**
     - Memelihara dan menyempurnakan skema Prisma (`prisma/schema.prisma`).
     - Mengelola migrasi database (`npx prisma migrate dev` / `npm run db:migrate`).
     - Menyediakan data dummy (seeder) yang realistis di `prisma/seed.ts` (Admin, Jadwal, User Demo).
  2. **API & Business Logic (`apps/api`):**
     - Memastikan endpoint autentikasi aman (Argon2 hashing, HttpOnly session cookie, CSRF/CORS handling).
     - Mengembangkan endpoint absensi (*check-in* & *check-out*), koreksi kehadiran, serta persetujuan (*review* admin).
     - Menjamin validasi input ketat menggunakan Zod/NestJS Pipes.
  3. **File & Storage Handler:**
     - Mengatur pipeline upload foto bukti absensi menggunakan Multer & Sharp (kompresi/resizing foto).
     - Memastikan foto tersimpan aman di direktori lokal terisolasi (`storage/evidence`) atau S3 storage tanpa ekspos publik langsung.

---

### 2. 💻 Aldo — Frontend Core & State Engineer
**Fokus Utama:** Mengelola arsitektur aplikasi React, alur routing, integrasi API, dan manajemen state.

- **Tugas Utama:**
  1. **Struktur & Routing Frontend (`apps/web/src`):**
     - Mengatur layout aplikasi dan proteksi rute (`React Router DOM`): membedakan halaman publik, dashboard user, dan dashboard admin.
     - Mengimplementasikan alur login, registrasi, sesi tersimpan, dan logout.
  2. **Integrasi API & State Management:**
     - Mengintegrasikan React Query (`@tanstack/react-query`) untuk fetching data, caching, mutasi, dan sinkronisasi server state.
     - Menyusun form validasi terstruktur memakai `react-hook-form` dan `zod` untuk login, profil, request koreksi, dan filter jadwal.
  3. **Dashboard & Manajemen Data:**
     - Menampilkan riwayat absensi, tabel rekapitulasi data untuk Admin, dan export data jika diperlukan.
     - Mengelola dialog/modal persetujuan koreksi dan approval user baru pada panel Admin.

---

### 3. 🎨 Rafi — UI/UX, Styling & Hardware Features Engineer
**Fokus Utama:** Tampilan visual responsif (Tailwind/CSS), pengalaman pengguna (UX), serta fitur interaktif kamera & geolokasi.

- **Tugas Utama:**
  1. **Desain & Antarmuka Responsif (Mobile-First):**
     - Mendesain antarmuka modern, bersih, dan nyaman digunakan baik di layar HP maupun desktop.
     - Memoles komponen UI: status badge (Hadir, Terlambat, Butuh Review), tombol interaktif, modal pop-up, skeleton loading, dan toast notifikasi.
  2. **Implementasi Fitur Kamera Langsung:**
     - Mengintegrasikan HTML5 `navigator.mediaDevices.getUserMedia` untuk pengambilan foto *live capture* langsung dari kamera perangkat (mencegah upload file galeri sembarangan).
     - Menyiapkan UI *preview* foto sebelum absensi dikirim.
  3. **Integrasi Geolocation:**
     - Menangani HTML5 `navigator.geolocation.getCurrentPosition` untuk mendeteksi koordinat latitude, longitude, dan estimasi akurasi browser.
     - Menampilkan indikator status GPS (Ready, Low Accuracy, atau Permission Denied) secara user-friendly.

---

### 4. 🛡️ Riandra — QA, Security, Testing & DevOps / Git Master
**Fokus Utama:** Kualitas kode, pengujian otomatis, kelancaran deployment lokal/Docker, serta standardisasi Git tim.

- **Tugas Utama:**
  1. **Testing & QA (`test`, `e2e`):**
     - Menulis dan menjalankan unit test API (Jest) serta web component test (Vitest).
     - Mengembangkan skenario *End-to-End* (E2E) testing dengan Playwright (`e2e/` & `playwright.config.ts`) untuk alur absensi lengkap (mocking GPS & camera).
  2. **DevOps & Environment Setup:**
     - Memastikan `docker-compose.yml` berjalan lancar di komputer semua anggota tim (MySQL & test database).
     - Membantu setup reverse proxy / tunneling (seperti Cloudflare Tunnel atau ngrok) agar fitur kamera dan GPS di smartphone dapat diuji lewat HTTPS.
  3. **Git Master & Repository Maintenance:**
     - Mengatur branching strategy (misal: `main`, `staging`, `feature/<nama-fitur>`).
     - Melakukan review Pull Request (PR), memastikan tidak ada file sensitif (`.env`, foto rahasia) ter-push ke GitHub.
     - Memastikan `README.md` dan dokumentasi teknis tetap terupdate.

---

## 🚀 Standar Alur Kolaborasi (Git Workflow)

1. **Pull Terlebih Dahulu Sebelum Mulai:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Buat Branch Khusus untuk Fitur Masing-Masing:**
   Format penamaan branch: `feat/<nama-anggota>-<fitur>` atau `fix/<nama-anggota>-<masalah>`
   ```bash
   git checkout -b feat/sarip-attendance-endpoint
   # atau
   git checkout -b feat/rafi-camera-capture
   ```
3. **Commit Pesan yang Jelas & Terstruktur:**
   Contoh: `feat(api): tambahkan validasi koordinat gps pada check-in`
4. **Push dan Buka Pull Request (PR):**
   ```bash
   git push origin feat/<nama-branch>
   ```
   Jangan merge langsung ke `main` tanpa konfirmasi atau review tim!
5. **Jalankan Pengecekan Kualitas Sebelum Push:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

---

## 📅 Target Milestone Proyek

- [ ] **Milestone 1: Setup Lingkungan & Database**
  - Seluruh anggota berhasil menjalankan `docker compose up -d` dan `npm run dev`.
  - Database schema & seeder berhasil dimigrasi.
- [ ] **Milestone 2: Autentikasi & Rute Dasar**
  - Login, register, proteksi rute halaman user & admin berfungsi.
- [ ] **Milestone 3: Fitur Utama Absensi (Kamera & GPS)**
  - Kamera browser aktif, koordinat terbaca, foto terkompresi dan terkirim ke backend.
- [ ] **Milestone 4: Admin Panel & Verifikasi**
  - Admin dapat memantau log kehadiran, bukti foto, serta menyetujui koreksi absensi.
- [ ] **Milestone 5: Testing, Polish UI & Demo Tugas Besar**
  - Semua test lulus (Jest/Vitest/Playwright), UI responsif di HP, siap dipresentasikan.
