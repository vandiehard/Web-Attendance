# Keputusan Implementasi

## 2026-10-11 — Fondasi monorepo
- **Keputusan:** Menggunakan npm workspaces tanpa package shared.
- **Alasan:** Sesuai PRD dan menjaga kontrak frontend/backend tetap eksplisit.
- **Dampak:** Kontrak API akan didefinisikan ulang pada masing-masing aplikasi dan diuji kesamaannya.

## 2026-10-11 — Runtime awal
- **Keputusan:** API memakai NestJS dengan prefix `/api/v1`; frontend memakai Vite proxy `/api` ke API lokal.
- **Alasan:** Menghindari kompleksitas CORS dan cookie pada pengembangan lokal.
- **Dampak:** Produksi memerlukan reverse proxy satu origin atau konfigurasi deployment setara.

## 2026-10-11 — Kebijakan yang dikunci PRD
- Jenis absensi `CHECK_IN` dan `CHECK_OUT`, tanpa face recognition dan tanpa geofence.
- Lokasi default `NEEDS_REVIEW`, ambang akurasi 100 meter.
- Keterlambatan default `ACCEPT_AS_LATE`; retensi foto 180 hari.
- Sesi opaque berbasis cookie HttpOnly dan timestamp resmi dari server.
