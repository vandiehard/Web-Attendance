# 🕒 Web Attendance System

> **Tugas Besar Pemrograman Web — Semester 5**  
> Sistem absensi web modern berbasis pengambilan foto kamera langsung (*live camera capture*), waktu resmi server (*server-authoritative timestamp*), dan koordinat geolokasi dari browser.

---

## 👥 Tim Pengembang

Project ini dikembangkan secara kolaboratif oleh:
- **Sarip** — *Backend & Database Engineer* (NestJS, Prisma, MySQL, Storage)
- **Aldo** — *Frontend Core & State Engineer* (React, React Router, React Query, Auth)
- **Rafi** — *UI/UX & Hardware Features Engineer* (Tailwind CSS, HTML5 Camera & Geolocation)
- **Riandra** — *QA, DevOps & Git Master* (Playwright, Jest/Vitest, Docker, Repository Maintenance)

> 📑 *Rincian detail pembagian tugas & tanggung jawab masing-masing anggota dapat dilihat di file [tugas.md](file:///d:/KULIAH/KULIAH%20SEMESTER%205/PEMROGRAMAN%20WEB/Web%20Attendance/tugas.md).*

---

## 🚀 Fitur Utama

- **Live Camera Evidence:** Pengambilan foto langsung melalui kamera browser tanpa unggah file galeri untuk meminimalkan manipulasi.
- **Server-Authoritative Time:** Waktu pencatatan kehadiran dikontrol penuh oleh server untuk mencegah manipulasi jam lokal pada perangkat pengguna.
- **Browser Geolocation:** Pencatatan titik koordinat (*latitude*, *longitude*, serta akurasi) saat absensi dilakukan.
- **Secure Authentication & Sessions:** Proteksi sesi menggunakan opaque session cookie berbasis `HttpOnly`, `SameSite=Lax`, dan password di-hash dengan algoritma Argon2.
- **Private Evidence Storage:** Foto bukti absensi disimpan pada storage lokal/S3 terisolasi dan hanya dapat diakses melalui endpoint terotorisasi.
- **Admin Dashboard:** Rekapitulasi absensi, verifikasi bukti foto kehadiran, manajemen jadwal, dan persetujuan pengajuan koreksi kehadiran.

---

## 🛠️ Tech Stack & Arsitektur

Project ini menggunakan arsitektur **Monorepo (npm workspaces)**:
- **Frontend (`apps/web`):** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, TanStack Query (React Query) v5, React Hook Form, Zod.
- **Backend (`apps/api`):** NestJS v11, TypeScript, Express, Prisma ORM v6, Sharp (image compression), Argon2, Multer.
- **Database & Storage:** MySQL 8.0 (via Docker Compose), Local Evidence Storage / AWS S3 compatibility.
- **Testing:** Vitest, Jest, Playwright (E2E).

---

## 💻 Panduan Menjalankan Project (Lokal)

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terpasang:
- **Node.js LTS** (v20+ / v22+) & **npm**
- **Docker Desktop** (untuk container MySQL)
- **Git**

### 2. Langkah Instalasi

1. **Clone repository:**
   ```bash
   git clone <URL_REPOSITORY_GITHUB_ANDA>
   cd "Web Attendance"
   ```

2. **Salin file konfigurasi environment:**
   ```bash
   # Windows (PowerShell / Command Prompt)
   copy .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

3. **Nyalakan container MySQL via Docker:**
   ```bash
   docker compose up -d mysql
   ```

4. **Install dependencies seluruh workspace:**
   ```bash
   npm install
   ```

5. **Migrasi database dan jalankan seeder:**
   ```bash
   # Validasi skema Prisma
   npm run db:validate

   # Eksekusi migrasi tabel ke MySQL
   npm run db:migrate

   # Isi database dengan data awal / demo
   npm run db:seed
   ```

6. **Jalankan aplikasi (Fullstack):**
   ```bash
   npm run dev
   ```

Aplikasi siap diakses pada:
- **Web App (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API Health Check (Backend):** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## 🔑 Akun Demo Default

Setelah menjalankan `npm run db:seed`, Anda dapat langsung login menggunakan akun berikut:

| Role | Email | Password | Keterangan |
|:---|:---|:---|:---|
| **Admin** | `admin@example.com` | `Admin12345` | Akses panel admin, rekapitulasi, & review |
| **User (Demo)** | `demo1@example.com` | `DemoUser12345` | Pengguna biasa untuk simulasi check-in/out |

---

## 📱 Uji Coba Kamera & GPS di Smartphone

Untuk menguji fitur kamera dan geolokasi di smartphone fisik, browser mewajibkan koneksi **HTTPS** (kecuali `localhost` pada laptop). 

Anda dapat menggunakan tunnel seperti **Cloudflare Tunnel** atau **ngrok**:
```bash
# Contoh menggunakan ngrok mengarah ke port frontend Vite
ngrok http 5173
```
Buka tautan HTTPS yang dihasilkan di browser smartphone Anda.

---

## 🧪 Validasi & Pengujian Kualitas Kode

Sebelum melakukan commit atau push ke GitHub, jalankan skrip berikut:

```bash
# Pengecekan tipe data TypeScript
npm run typecheck

# Linting kode
npm run lint

# Build test (memastikan build frontend & backend tidak gagal)
npm run build

# Menjalankan unit test
npm test

# Menjalankan end-to-end testing
npm run test:e2e
```

---

## 📂 Struktur Direktori

```text
Web Attendance/
├── apps/
│   ├── api/             # Backend service (NestJS, business logic, endpoints)
│   └── web/             # Frontend application (React, Vite, Tailwind CSS)
├── prisma/              # Schema database dan skrip seeder
├── storage/             # Direktori penyimpanan bukti foto lokal terisolasi
├── e2e/                 # Pengujian end-to-end dengan Playwright
├── docker-compose.yml   # Konfigurasi container service (MySQL)
├── PRD.md               # Product Requirements Document & spesifikasi teknis
├── tugas.md             # Dokumen rincian pembagian tugas tim
└── README.md            # Dokumentasi utama project
```

---

## 🤝 Panduan Kontribusi Tim (Git Rules)

1. Jangan commit file credential atau file `.env` ke GitHub (pastikan `.gitignore` aktif).
2. Buat branch baru untuk setiap fitur: `feat/<nama-anggota>-<fitur>`.
3. Selalu lakukan `git pull origin main` sebelum mulai bekerja untuk menghindari merge conflict.
4. Pastikan `npm run typecheck` dan `npm run lint` lolos sebelum membuka Pull Request (PR).
