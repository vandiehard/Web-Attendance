# Web Attendance System

Aplikasi absensi berbasis foto kamera langsung, timestamp server, dan lokasi yang dilaporkan browser. Sistem tidak memakai pengenalan wajah, template biometrik, atau geofence.

## Prasyarat

- Node.js LTS aktif
- Docker dan Docker Compose
- npm

## Menjalankan fondasi lokal

```text
copy .env.example .env
 docker compose up -d
 npm install
 npm run db:validate
 npm run db:migrate
 npm run db:seed
 npm run dev
```

API health check: `GET http://localhost:3000/api/v1/health`.

Tahap berikutnya akan menambahkan model data lengkap, autentikasi, fitur absensi, storage privat, serta test integrasi/E2E. Kamera dan GPS pada perangkat nyata memerlukan HTTPS, kecuali localhost.
