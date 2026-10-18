# Acceptance Checklist

Bukti otomatis yang tersedia: `apps/api/src/health.spec.ts`, `apps/web/src/main.test.tsx`, Prisma migration/seed, serta typecheck/lint/build. Checklist berikut mencatat cakupan implementasi.

- [x] Registrasi valid, email/NPM unik, status PENDING, role tidak dapat diubah — `AuthController.register`, constraint Prisma.
- [x] Approval/reject admin atomik dan tercatat — `AdminController`, audit transaction.
- [x] Kamera langsung, pratinjau, error izin — `useCamera` di `apps/web/src/main.tsx`.
- [x] Foto diproses dan disimpan sebelum sukses — `AttendanceService.processImage` + storage transaction.
- [x] Tidak ada face recognition/biometrik/geofence — audit source dan schema.
- [x] Timestamp server UTC dan format WIB — `AttendanceService`, `formatWib`.
- [x] Lokasi tanpa koordinat palsu, akurasi ditandai — `AttendanceService.location`.
- [x] Check-in/out, idempotensi, duplicate constraint, check-in prerequisite — `AttendanceService`.
- [x] Riwayat ownership dan streaming foto privat — `AttendanceController`.
- [x] Admin endpoint role protected — `AuthGuard`/`RoleGuard`.
- [x] Koreksi dan audit dasar — `CorrectionController`.
- [x] CSV BOM dan injection escaping — `ReportsController`.
- [~] E2E kamera/GPS, concurrency/storage failure integration, retensi scheduled job — belum memiliki suite otomatis penuh.

Status `[~]` tidak boleh dianggap bukti release production; jalankan suite integrasi/E2E khusus deployment sebelum produksi.
