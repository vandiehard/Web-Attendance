# API

Prefix semua endpoint: `/api/v1`. Respons sukses `{ success: true, data }`; error `{ success: false, error: { code, message } }`. Mutasi browser wajib mengirim `X-Requested-With: XMLHttpRequest`; upload memakai `multipart/form-data` tanpa menetapkan `Content-Type` manual.

## Auth
- `POST /auth/register` — `fullName`, `npm`, `className`, `phoneNumber`, `email`, `password`; selalu membuat USER `PENDING`.
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `GET /registrations/me`.

## Absensi
- `GET /attendance/precheck`, `GET /attendance/me`, `GET /attendance/me/:id`.
- `POST /attendance/check-in` dan `/check-out`: header `Idempotency-Key` UUID v4; field `evidence`, `sessionId`, koordinat opsional, dan metadata waktu perangkat.
- `GET /attendance/me/:id/evidence`: streaming terotorisasi, `Cache-Control: private, no-store`.

## Admin
- Registrasi: `GET /admin/registrations`, `POST /admin/registrations/:id/approve|reject`.
- Pengguna: `GET /admin/users`, `PATCH /admin/users/:id/status`.
- Jadwal: `POST /admin/schedules`, `POST /admin/schedules/:id/publish|close`; baca lewat `GET /schedules`.
- Absensi: `GET /admin/attendance`.
- Laporan: `GET /admin/reports/attendance`, `GET /admin/reports/attendance/export` (CSV UTF-8 BOM, aman CSV injection).
- Koreksi: `POST /attendance/:recordId/corrections`, `GET /admin/attendance-corrections`, approve/reject.
- Audit: `GET /admin/audit-logs`.

Kode penting: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `EMAIL_ALREADY_USED`, `NPM_ALREADY_USED`, `IDEMPOTENCY_KEY_REQUIRED`, `ATTENDANCE_SESSION_NOT_FOUND`, `ATTENDANCE_WINDOW_PASSED`, `ATTENDANCE_ALREADY_RECORDED`, `CHECK_IN_REQUIRED`, `EVIDENCE_REQUIRED`, `EVIDENCE_INVALID`, `EVIDENCE_UPLOAD_FAILED`, `EVIDENCE_EXPIRED`.
