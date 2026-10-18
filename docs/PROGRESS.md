# Progress Web Attendance

## Bugfix/demo status
- [x] B1 — Kebocoran passwordHash/field internal: sanitizer global rekursif + test.
- [x] B2 — Pendaftaran admin: tabel, filter, pencarian, approve/reject, konfirmasi.
- [x] B3 — Login ACTIVE/PENDING/REJECTED/SUSPENDED: status-aware routing dan cookie/CSRF diverifikasi.
- [x] B4 — Dashboard admin: endpoint statistik database khusus dan kartu angka nyata.
- [x] B5 — Data absensi admin: tabel terstruktur, bukan JSON mentah.
- [x] B6 — Sidebar admin: duplikasi dihapus; jadwal, koreksi, laporan, audit ditambahkan.
- [x] B7 — Subjudul halaman admin dibuat spesifik.
- [x] B8 — Scrollbar gutter, layout min-width, tabel/form responsif; sweeper lulus desktop.
- [x] B9 — Branding Attendly, title tab, favicon SVG.
- [x] B10 — Sweeper Playwright menemukan dan memperbaiki overflow jadwal serta crash profile.
- [x] Demo seed/reset — `npm run demo:reset` menghasilkan admin, 6 active, 3 pending, rejected, suspended, jadwal, foto, koreksi, notifikasi, audit.
- [x] Demo path — register → approve → active login berhasil.

## Verifikasi terakhir
- `npm run demo:reset`: berhasil.
- `npm run typecheck`: berhasil.
- `npm run lint`: berhasil.
- `npm run build`: berhasil.
- `npm test`: 3 suite / 3 test lulus (2 API, 1 web).
- Smoke API: `/api/v1/health` mengembalikan database `ok`.
- Curl login admin, active user, pending user: berhasil.
- Curl suspended user: `401 ACCOUNT_SUSPENDED`.
- Curl user ke endpoint admin: `403 FORBIDDEN`.
- Curl endpoint registrations: tidak memuat `passwordHash`, `argon2`, `sessionTokenHash`, `objectKey`, atau `pendingKey`.
- `npx playwright test --config=playwright.config.ts`: 2 test lulus (demo-path dan route sweeper), screenshot desktop tersimpan lokal dan di-ignore Git.
- Seed terakhir juga membuat 1 absensi hari ini agar kartu dashboard tidak kosong.

## Catatan batasan
- Demo-path memverifikasi alur registrasi/approval/login; pengambilan kamera/GPS penuh tetap bergantung pada perangkat/browser.
- Sebagian endpoint admin lanjutan masih memakai tabel generik terstruktur, bukan dialog/detail kaya penuh.
- Retensi foto perlu dijalankan sebagai job terjadwal pada deployment production.
