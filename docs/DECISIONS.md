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

## 2026-10-11 — Storage lokal sebagai default
- **Keputusan:** Default development/test memakai `LocalStorageService`; driver S3 tersedia untuk production.
- **Alasan:** Image MinIO gagal di-pull pada lingkungan awal dan object storage S3 di PRD bersifat opsional.
- **Dampak:** `docker compose up -d` hanya membutuhkan MySQL; foto lokal berada di `storage/evidence` dan tidak diekspos web.

## 2026-10-11 — Demo presentation hardening
- **Keputusan:** Menambahkan serializer response defense-in-depth dan route guard status-aware (`/status`, `/app`, `/admin`).
- **Alasan:** Audit manual menemukan entitas Prisma mentah dan status akun belum membedakan akses terbatas.
- **Dampak:** Field credential/storage internal tidak pernah dikirim ke browser; akun PENDING/REJECTED dapat melihat status tanpa menu absensi.
