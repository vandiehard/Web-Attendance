# PROMPT UNTUK ZED AGENT — Web Attendance System

> Cara pakai: taruh PRD di `docs/PRD.md` (dan boleh juga di root repo), buka folder proyek kosong di Zed, lalu paste semua isi di bawah garis ini ke Agent Panel.

---

## 1. PERAN DAN TUJUAN

Kamu adalah senior full-stack engineer yang mengerjakan SELURUH proyek **Web Attendance System** dari nol sampai selesai, berjalan, teruji, dan terdokumentasi. Targetnya: aplikasi yang bisa dijalankan lokal dengan satu rangkaian perintah, lulus semua test, dan memenuhi seluruh Acceptance Criteria (PRD bagian 16) serta Definition of Done (PRD bagian 24).

**Sumber kebenaran utama: `docs/PRD.md`.** Baca SELURUH file itu dari awal sampai akhir sebelum menulis kode apa pun, lalu baca ulang bagian yang relevan sebelum mengerjakan tiap tahap. Prompt ini hanya menambahkan (a) keputusan yang sudah dikunci, (b) aturan kerja, dan (c) daftar jebakan teknis. Jika prompt ini dan PRD bertentangan, PRD menang, kecuali pada bagian "Keputusan yang Dikunci" (bagian 4) yang memang dibuat untuk menutup ambiguitas PRD.

Inti produk (jangan sampai melenceng):
- Absensi = **foto langsung dari kamera + waktu resmi dari server + koordinat lokasi yang dilaporkan browser**.
- **TIDAK ADA face recognition / face matching / template biometrik / liveness.** Jangan buat tabel `FaceProfile`, `FaceEmbedding`, `FaceTemplate`, jangan install library pengenalan wajah (face-api.js, mediapipe, tensorflow, dsb), jangan buat komponen UI face enrollment. Foto hanya bukti visual.
- **TIDAK ADA geofence.** Lokasi tidak pernah dipakai untuk menolak absensi karena jarak.
- Pendaftaran harus disetujui admin. Hanya akun `ACTIVE` yang boleh absen.

---

## 2. ATURAN KERJA (supaya tidak macet dan tidak berbuat bug)

1. **Jangan berhenti untuk bertanya.** Setiap ambiguitas: pilih default yang masuk akal, catat di `docs/DECISIONS.md` (keputusan, alasan, dampak), lalu lanjut. Bagian 4 sudah menjawab sebagian besar ambiguitas.
2. **Kerjakan per tahap sesuai PRD bagian 20 (Tahap 1–10)** dan jangan lompat. Di akhir tiap tahap WAJIB melewati *gerbang verifikasi* (bagian 7). Jangan mulai tahap berikutnya sebelum gerbang lulus.
3. **Jangan pernah mengklaim sesuatu "sudah jalan" tanpa menjalankannya.** Jalankan install, migrate, typecheck, lint, test, build, lalu baca output sampai habis. Kalau gagal, perbaiki akar masalahnya.
4. **Dilarang:** `any` tanpa alasan tertulis, `@ts-ignore`/`@ts-expect-error` untuk menutupi error, mematikan aturan lint, menghapus/melewati (`skip`, `only`, `xit`) test yang gagal, data dummy/mock di kode produksi, `TODO`/`FIXME`/placeholder/fungsi kosong, `console.log` sisa debug, dan "nanti diimplementasi".
5. **Jangan mengarang API library.** Versi library berubah. Sebelum memakai API yang kamu tidak 100% yakin, cek dokumentasi resmi (kalau punya akses web) atau baca tipe/README di `node_modules`. Setelah `npm install`, jalankan `npm ls` untuk memastikan tidak ada peer dependency yang bentrok. Pin versi eksak (tanpa `^` untuk dependensi inti) dan commit lockfile.
6. **Terminal di Zed: jangan jalankan proses yang tidak pernah berhenti di foreground** (dev server, `--watch`, `docker compose up` tanpa `-d`). Gunakan mode sekali-jalan (`vitest run`, `jest --runInBand`, `playwright test`). Untuk smoke test server: jalankan di background, tunggu sampai health check OK, uji dengan `curl`, lalu matikan prosesnya. Beri timeout pada perintah yang berpotensi menggantung.
7. **Script harus lintas-platform** (Windows/macOS/Linux): pakai `cross-env`, hindari sintaks bash-only di `package.json`.
8. **Kalau Docker/MySQL/MinIO tidak bisa dijalankan di lingkunganmu:** jangan berhenti. Tetap tulis seluruh kode, jalankan semua yang bisa dijalankan (typecheck, lint, unit test, build), tandai dengan jelas test integrasi/E2E mana yang belum bisa dijalankan beserta perintah persisnya di `README.md`, lalu lanjut ke tahap berikutnya.
9. **Commit git per tahap** dengan pesan jelas (`feat(auth): ...`). Pastikan `.env`, `node_modules`, dan file rahasia ada di `.gitignore`. Hanya `.env.example` yang boleh di-commit.
10. **Satu perubahan = satu alasan.** Jangan refactor besar-besaran di luar tahap yang sedang dikerjakan.
11. Kalau menemukan kontradiksi atau lubang di PRD, catat di `docs/DECISIONS.md`, putuskan sendiri, dan tetap patuhi prinsip utama PRD bagian 1.2.

---

## 3. STACK (sesuai PRD bagian 4) — dan cara memasangnya dengan benar

Monorepo **npm workspaces** (tanpa tooling tambahan), struktur mengikuti PRD bagian 19: `apps/web`, `apps/api`, `prisma/` (di root atau dalam `apps/api`, pilih satu dan konsisten), `docs/`.

- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router + TanStack Query + React Hook Form + Zod. Untuk Tailwind dan shadcn/ui, **ikuti panduan instalasi resmi untuk Vite versi saat ini** (setup berbeda antara Tailwind v3 dan v4; jangan mencampur). Pastikan alias `@/` terkonfigurasi di `tsconfig` DAN `vite.config`.
- Backend: Node.js (LTS aktif, cek `node -v`) + NestJS + TypeScript + Prisma + MySQL 8.4 + `argon2` (Argon2id) + `@nestjs/throttler` + `@nestjs/schedule` + `multer` (via `@nestjs/platform-express`) + `sharp` + `@aws-sdk/client-s3` + `cookie-parser` + `helmet`. Validasi backend memakai **Zod** lewat `ZodValidationPipe` buatan sendiri (jangan campur dengan class-validator).
- Dev infra via `docker-compose.yml`: `mysql:8.4` (dengan healthcheck, charset `utf8mb4`), **MinIO** sebagai object storage S3-compatible (bucket dibuat otomatis lewat service init `mc` atau lewat kode saat boot), serta database terpisah untuk test (mis. `attendance_test`).
- Test: Vitest + React Testing Library (web), Jest + Supertest (api), Playwright (E2E).
- Tidak ada package `shared` terpisah (hindari masalah ESM/CJS). Enum dan tipe kontrak API di frontend ditaruh di `apps/web/src/types/` dan harus sama persis dengan backend.

Dev tanpa CORS/cookie ribet: Vite memakai **proxy `/api` → backend**, sehingga browser melihat satu origin. `API_BASE_URL` frontend = `/api/v1`.

---

## 4. KEPUTUSAN YANG DIKUNCI (jawaban untuk PRD bagian 23 — jangan ditanyakan lagi)

Semua yang bersifat kebijakan harus **bisa dikonfigurasi admin lewat tabel `SystemSetting`** (key-value, dengan nilai default berikut, dan perubahan tercatat di audit log), bukan hardcode:

| Hal | Keputusan |
| --- | --- |
| Jenis absensi | `CHECK_IN` dan `CHECK_OUT`, keduanya memakai foto. |
| Check-out | Wajib sudah ada check-in `PRESENT`/`LATE`/`NEEDS_REVIEW` pada sesi yang sama. Pengecualian hanya lewat koreksi yang disetujui admin. |
| Kebijakan lokasi | `LOCATION_POLICY` = `REQUIRED` \| `ALLOW_UNAVAILABLE` \| `NEEDS_REVIEW`. **Default `NEEDS_REVIEW`**: absensi tetap diterima, `locationStatus=UNAVAILABLE`, `status=NEEDS_REVIEW`. Jangan pernah mengarang koordinat. |
| Ambang akurasi | `LOCATION_MAX_ACCURACY_METERS` default **100**. Di atas ambang → `locationStatus=LOW_ACCURACY` dan status `NEEDS_REVIEW` (tidak ditolak). Koordinat di luar rentang (lat −90..90, lon −180..180, bukan NaN/Infinity) → `INVALID`. |
| Keterlambatan | `LATE_POLICY` = `ACCEPT_AS_LATE` \| `NEEDS_REVIEW` \| `REJECT_AFTER_DEADLINE`. **Default `ACCEPT_AS_LATE`**. Terlambat = waktu server > `lateAfter` jadwal dan ≤ `checkInEndAt`. Setelah `checkInEndAt` → ditolak (`ATTENDANCE_SESSION_CLOSED`/`ATTENDANCE_WINDOW_PASSED`), kecuali kebijakan lain dipilih. |
| Jadwal vs sesi | `Schedule` = definisi jendela waktu (datetime absolut UTC, input admin dalam WIB) + `targetClassName` opsional. Saat jadwal di-*publish*, sistem otomatis membuat tepat satu `AttendanceSession` (tanggal sesi = tanggal WIB dari `checkInStartAt`). Tidak ada jadwal berulang di v1. Status `ACTIVE` pada sesi **dihitung saat dibaca** (PUBLISHED + waktu server berada dalam jendela), bukan disimpan; yang disimpan: `DRAFT/PUBLISHED/CLOSED/CANCELLED`. |
| Absen tanpa jadwal | Tidak didukung. Absensi selalu terikat sesi. |
| Peran admin dalam absensi | Admin **tidak** melakukan absensi (endpoint absensi menolak role `ADMIN`). |
| Login saat belum aktif | `PENDING` dan `REJECTED` boleh login dalam **mode terbatas** (hanya halaman status pendaftaran, `/auth/me`, `/registrations/me`, logout). `SUSPENDED` ditolak login dengan `ACCOUNT_SUSPENDED`. Semua endpoint absensi memakai `ActiveAccountGuard`. |
| Koreksi absensi | Jenis: `MISSING_CHECK_IN`, `MISSING_CHECK_OUT`, `STATUS_CHANGE`, `OTHER`. Saat disetujui: catatan asli **tidak ditimpa**; untuk "missing" dibuat catatan baru bertanda `source=MANUAL_CORRECTION` tanpa foto (satu-satunya pengecualian BR-005, wajib alasan + audit log); untuk `STATUS_CHANGE` status lama disimpan di `AttendanceCorrection` (`previousStatus`, `newStatus`) dan di audit log `beforeData/afterData`. |
| Ekspor | **CSV saja** (UTF-8 dengan BOM agar Excel membaca benar), kolom menyebut zona waktu `Asia/Jakarta` dan membedakan `serverTimestamp` vs waktu perangkat. **Wajib proteksi CSV injection**: sel yang diawali `=`, `+`, `-`, `@`, tab, atau CR diberi awalan `'`. Tanpa foto, koordinat hanya jika filter eksplisit memintanya. Setiap ekspor masuk audit log. XLSX/PDF tidak dikerjakan. |
| Email | Notifikasi hanya in-app. Lupa/reset password memakai `MailService` abstrak dengan driver `console` (mencetak tautan reset ke log server saat dev) agar tidak butuh SMTP. Token reset: acak 32 byte, disimpan **hash**-nya, kedaluwarsa 30 menit, sekali pakai, dan reset mencabut semua `AuthSession` user. Respons `forgot-password` selalu sama baik email ada maupun tidak. |
| Retensi foto | `PHOTO_RETENTION_DAYS` default **180**. Job harian (`@nestjs/schedule`) menghapus objek yang `expiresAt` lewat dan bukan `QUARANTINED`, set evidence `DELETED`, catat audit log. Metadata absensi tetap ada. |
| Akses foto | Backend **streaming terotorisasi** lewat endpoint (`GET /attendance/me/:id/evidence`, `GET /admin/attendance/:id/evidence`) dengan `Cache-Control: private, no-store`. Tidak ada URL publik, `objectKey` tidak pernah dikirim ke klien. Akses foto oleh admin dicatat di audit log. |
| Autentikasi | Sesi opaque: token acak 32 byte di cookie `HttpOnly; Secure (di produksi); SameSite=Lax; Path=/`, hash SHA-256-nya di `AuthSession`. Sesi bisa dicabut, ada expiry (default 7 hari) dan idle refresh sederhana. Proteksi CSRF: semua request mutasi (POST/PATCH/PUT/DELETE) wajib lolos pengecekan header `Origin` terhadap `APP_BASE_URL` DAN header kustom `X-Requested-With: XMLHttpRequest`. Tidak ada token di `localStorage`. |
| Kebijakan password | Minimal 10 karakter, mengandung huruf besar, huruf kecil, dan angka, maksimal 128. Hash Argon2id. |
| Admin pertama | Dibuat lewat `prisma/seed.ts` dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` (env). Seed idempoten (aman dijalankan berulang). Tidak ada endpoint publik untuk membuat admin. |
| Zona waktu | Server, Node, dan MySQL berjalan UTC (`TZ=UTC`). Semua `DateTime` disimpan UTC. Tampilan memakai `Asia/Jakarta` via `Intl.DateTimeFormat` dengan `timeZone: 'Asia/Jakarta'`. WIB tidak punya DST, jadi offset tetap +07:00. |
| Bahasa | UI dan pesan error: Bahasa Indonesia. Kode error: konstanta Inggris `UPPER_SNAKE_CASE`. |

---

## 5. ATURAN TEKNIS KRITIS (area yang paling sering jadi bug — patuhi semuanya)

### 5.1 Kontrak API
- Semua endpoint di `/api/v1` persis seperti PRD bagian 11 (path, method, fungsi).
- Bentuk respons seragam: `{ "success": true, "data": ... }` dan `{ "success": false, "error": { "code": "...", "message": "..." , "details"?: ... } }`. Implementasikan lewat interceptor dan exception filter global. Respons list: `{ success, data: { items, page, pageSize, total } }`. Pagination wajib untuk daftar pengguna, riwayat, absensi admin, audit log, dan koreksi (default 20, maksimal 100).
- Katalog kode error ada di satu file konstanta, minimal: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `INVALID_CREDENTIALS`, `ACCOUNT_PENDING`, `ACCOUNT_REJECTED`, `ACCOUNT_SUSPENDED`, `EMAIL_ALREADY_USED`, `NPM_ALREADY_USED`, `IDEMPOTENCY_KEY_REQUIRED`, `ATTENDANCE_SESSION_NOT_FOUND`, `ATTENDANCE_SESSION_NOT_OPEN`, `ATTENDANCE_SESSION_CLOSED`, `ATTENDANCE_WINDOW_PASSED`, `ATTENDANCE_ALREADY_RECORDED`, `CHECK_IN_REQUIRED`, `EVIDENCE_REQUIRED`, `EVIDENCE_INVALID`, `EVIDENCE_TOO_LARGE`, `EVIDENCE_UPLOAD_FAILED`, `LOCATION_REQUIRED`, `LOCATION_INVALID`, `EVIDENCE_EXPIRED`. Frontend memetakan tiap kode ke pesan yang ramah.
- Error tidak boleh membocorkan stack trace, SQL, atau detail internal ke klien. Login gagal selalu `INVALID_CREDENTIALS` dengan pesan sama (tidak membedakan email salah vs password salah; lakukan hash dummy agar waktu respons mirip).
- `GET /attendance/precheck` mengembalikan: status akun, sesi yang sedang relevan untuk user (sesuai kelas), jenis absensi yang boleh dilakukan sekarang, catatan absensi yang sudah ada, `serverTime`, kebijakan lokasi dan ambang akurasi. Frontend memakai ini untuk menentukan tombol mana yang aktif.

### 5.2 Database (Prisma + MySQL)
- Skema mengikuti PRD bagian 9–10. Tambahkan `SystemSetting`, `PasswordResetToken`, dan field tambahan yang diputuskan di bagian 4 (`targetClassName`, `lateBehavior` bila perlu, `source` pada `AttendanceRecord`, `previousStatus/newStatus` pada koreksi). Jangan membuat tabel wajah apa pun.
- Gunakan `DateTime(3)` untuk semua timestamp, `Decimal(9,6)` untuk latitude/longitude (atau `Double` bila konsisten), `Int` untuk `accuracyMeters` bila dibulatkan, `String @db.VarChar(...)` dengan panjang eksplisit untuk kolom yang diberi index/unique (MySQL membatasi panjang key).
- **Constraint integritas (wajib di level DB, bukan hanya di kode):**
  - `User.email` unik; `UserProfile.npm` unik; `UserProfile.userId` unik.
  - `AttendanceRecord`: `@@unique([userId, sessionId, type])` dan `@@unique([userId, idempotencyKey])`.
  - `AttendanceSession`: `@@unique([scheduleId, sessionDate])`.
  - `AttendanceEvidence.attendanceRecordId` unik; `sha256` ter-index.
  - Satu `RegistrationRequest` `PENDING` per user: MySQL tidak punya partial unique index, jadi gunakan kolom nullable `pendingKey` yang diisi `'PENDING'` hanya saat pending (NULL saat tidak), dengan `@@unique([userId, pendingKey])`. Kosongkan saat keputusan dibuat.
- Operasi multi-langkah (registrasi: User + Profile + RegistrationRequest; approve: update request + user + notifikasi + audit log; check-in: record + evidence + audit bila perlu) dibungkus **`prisma.$transaction`**.
- Persetujuan/penolakan pendaftaran harus **atomik dan aman terhadap klik ganda**: gunakan `updateMany({ where: { id, status: 'PENDING' } })` lalu periksa `count === 1`; kalau 0 → kembalikan konflik yang jelas.
- Tangani error Prisma `P2002` (unique violation) menjadi kode error domain yang tepat, bukan 500.
- Migrasi dibuat dengan `prisma migrate dev` dan di-commit; `prisma migrate deploy` untuk produksi/test. Test integrasi memakai database terpisah dan membersihkan data antar test.

### 5.3 Autentikasi dan otorisasi
- `AuthGuard` global (default deny), dekorator `@Public()` hanya untuk register/login/forgot/reset/health. `RolesGuard` + `@Roles('ADMIN')`. Seluruh `/admin/*` wajib `ADMIN`.
- **Pemeriksaan kepemilikan di query, bukan di akhir**: query riwayat/detail/koreksi selalu `where: { id, userId: currentUser.id }`; bila tidak ketemu → `404 NOT_FOUND` (jangan 403, agar keberadaan data tidak bocor). `userId` TIDAK PERNAH diambil dari body/query/param.
- Registrasi memakai skema Zod **strict**: field `role`, `accountStatus`, `userId`, dsb. yang tidak ada di skema ditolak/diabaikan; role selalu `USER`, status selalu `PENDING`.
- Rate limiting: umum 100 req/menit/IP; `login`, `register`, `forgot-password`, `reset-password` jauh lebih ketat (mis. 5–10/menit); `check-in`/`check-out` dibatasi per user. Perhatikan `trust proxy` agar IP benar di belakang reverse proxy.
- Perubahan status akun oleh admin (`SUSPENDED`) harus **mencabut semua `AuthSession` aktif** user itu seketika.
- Admin tidak boleh menonaktifkan/menangguhkan dirinya sendiri atau menurunkan admin terakhir.

### 5.4 Foto bukti dan storage
- Upload: `multipart/form-data`, field file `evidence`, penyimpanan memori Multer dengan `limits.fileSize` (default `MAX_UPLOAD_SIZE_MB=5`), hanya 1 file.
- Validasi di backend: ukuran, **magic bytes** (bukan hanya `Content-Type`/ekstensi), hanya JPEG/PNG/WebP. Lalu proses dengan `sharp`: `rotate()` (terapkan orientasi EXIF), resize maksimal sisi terpanjang 1280 px, **re-encode ke JPEG kualitas ~80 (sekaligus membuang metadata EXIF/GPS)**. Hitung `sha256` dari hasil akhir yang disimpan. Gambar yang gagal di-decode → `EVIDENCE_INVALID`.
- Object key acak (`evidence/YYYY/MM/<uuid>.jpg`), bukan nama user/NPM.
- **Urutan saat check-in/out** (hindari catatan yatim/absensi palsu): (1) validasi akun, sesi, jendela waktu, duplikasi, idempotensi → (2) validasi & proses gambar → (3) upload ke storage → (4) transaksi DB membuat `AttendanceRecord` + `AttendanceEvidence(status=STORED)` → (5) bila langkah 4 gagal, **hapus objek yang sudah terunggah** (best effort + catat error) dan kembalikan error. Jika langkah 3 gagal → `EVIDENCE_UPLOAD_FAILED`, tidak ada record. Respons sukses HANYA setelah transaksi commit dan evidence `STORED` (BR-005, BR-018, BR-019).
- Job pembersih untuk objek yatim/`PENDING_UPLOAD` yang lebih tua dari 1 jam.
- Kunci/secret storage hanya di env backend. Bucket privat.

### 5.5 Logika absensi
- Waktu resmi `serverTimestamp = new Date()` di backend pada saat request diterima (`receivedAt` sama atau lebih awal dari waktu commit; simpan keduanya). Nilai waktu dari klien (`photoCapturedAtClient`, `locationCapturedAtClient`) hanya metadata: parse dengan aman, abaikan (simpan `null`) kalau tidak valid, dan jangan pernah dipakai untuk keputusan.
- Idempotensi: header `Idempotency-Key` wajib (UUID v4). Request ulang dengan key yang sama dari user yang sama → kembalikan hasil asli (HTTP 200, objek sama, **tanpa** unggah ulang ke storage). Key berbeda tetapi `(user, sesi, tipe)` sudah ada → `409 ATTENDANCE_ALREADY_RECORDED`. Request bersamaan harus aman: andalkan unique constraint DB sebagai penentu akhir dan tangani `P2002`.
- Urutan validasi: akun `ACTIVE` → role `USER` → sesi ada & `PUBLISHED` & user termasuk kelas target → jendela waktu (check-in/out) → untuk check-out: ada check-in valid → duplikasi → lokasi sesuai kebijakan → gambar.
- Status akhir ditentukan fungsi murni yang mudah di-unit-test, menerima (waktu server, jadwal, kebijakan, kondisi lokasi) dan mengembalikan `PRESENT | LATE | NEEDS_REVIEW | REJECTED` + `locationStatus`.
- UI/respons **tidak boleh menyatakan lokasi "terverifikasi"**. Gunakan frasa seperti "lokasi dilaporkan perangkat".

### 5.6 Frontend: kamera dan lokasi (sumber bug terbanyak)
- Kamera hanya dibuka setelah aksi pengguna di halaman absensi, bukan saat halaman dimuat di tempat lain. Gunakan `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal } , width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })`.
- `<video autoPlay playsInline muted>` — **`playsInline` dan `muted` wajib** agar jalan di iOS Safari; panggil `video.play()` dan tangani promise-nya.
- **React StrictMode memanggil effect dua kali di dev**: buat hook `useCamera` yang membersihkan dengan benar (`stream.getTracks().forEach(t => t.stop())` saat unmount/ganti kamera/setelah foto diambil/saat tab hidden), dan aman terhadap race (stream lama dihentikan sebelum stream baru; abaikan hasil `getUserMedia` yang selesai setelah unmount).
- Pilih kamera depan/belakang dengan `facingMode`; bila `OverconstrainedError`, fallback tanpa constraint. Jalankan `enumerateDevices()` **setelah** izin diberikan. Sembunyikan tombol ganti kamera bila hanya satu kamera.
- Tangani dan tampilkan pesan Indonesia untuk: `NotAllowedError` (izin ditolak + petunjuk membuka pengaturan browser), `NotFoundError` (tidak ada kamera), `NotReadableError` (dipakai aplikasi lain), `OverconstrainedError`, `SecurityError`/konteks tidak aman (`window.isSecureContext === false`, jelaskan perlu HTTPS), dan browser tanpa dukungan. Semua dengan tombol "Coba lagi".
- Ambil foto: gambar frame `video` ke `canvas` memakai `video.videoWidth/videoHeight` (bukan ukuran CSS), tunggu sampai `videoWidth > 0`, lalu `canvas.toBlob(cb, 'image/jpeg', 0.85)` → `File`. Hasil foto **tidak di-mirror** (mirror hanya pada pratinjau kamera depan lewat CSS). Tidak ada input `type=file`/galeri di alur absensi (FR-005 poin 9). Tampilkan pratinjau hasil + tombol "Ulangi" sebelum kirim.
- Lokasi: `navigator.geolocation.getCurrentPosition(ok, err, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })` dibungkus Promise. Tangani kode error 1 (ditolak), 2 (tidak tersedia), 3 (timeout). Kirim `latitude`, `longitude`, `accuracyMeters` (`coords.accuracy`), `locationCapturedAtClient` (dari `position.timestamp` → ISO). Kalau lokasi gagal, jangan kirim koordinat apa pun; ikuti kebijakan dari `precheck`. Tampilkan pemberitahuan bahwa lokasi dicatat saat absensi (NFR-002).
- Kirim dengan `FormData`. **Jangan set header `Content-Type` manual** (browser mengisi boundary). Semua nilai FormData adalah string, jadi backend harus `z.coerce.number()` dan memvalidasi.
- `Idempotency-Key` dibuat (`crypto.randomUUID()`) **sekali per foto yang diambil** dan dipakai ulang pada retry; foto baru (retake) = key baru. Tombol kirim di-disable selama proses (cegah klik ganda). Jaringan putus → tampilkan status offline dan izinkan retry dengan key yang sama.
- **Status "berhasil" hanya ditampilkan setelah respons sukses dari server**, dengan menampilkan `serverTimestamp` dari respons (BR-018). Jam perangkat di UI hanya informasi visual dan diberi label.
- Layout mobile-first: tombol besar (min. tinggi 44 px), tidak ada scroll horizontal, `100dvh` untuk layar penuh.

### 5.7 Waktu
- Satu modul util waktu (`formatWib`, `toUtcFromWibInput`, dll.) dipakai di seluruh UI; dilarang `toLocaleString()` tanpa `timeZone`. Input jadwal admin (`datetime-local`) dianggap WIB dan dikonversi ke UTC secara eksplisit sebelum dikirim. Unit test untuk konversi (termasuk batas tengah malam WIB↔UTC).

### 5.8 Audit log dan notifikasi
- Audit log dibuat dalam transaksi yang sama dengan perubahan datanya. Tidak ada endpoint ubah/hapus audit log. `beforeData/afterData` disanitasi (tanpa password/token/hash). Cakup semua aksi di FR-016 ditambah akses foto oleh admin, ekspor, dan perubahan `SystemSetting`.
- Notifikasi in-app dibuat untuk semua kejadian FR-015; UI menampilkan jumlah belum dibaca dan bisa menandai dibaca.

### 5.9 Keamanan umum
- `helmet`, CORS dimatikan/ketat (proxy dev membuat satu origin), body size limit, validasi semua input, tanpa `dangerouslySetInnerHTML`, query Prisma terparameter (hindari `$queryRawUnsafe`).
- Log tidak boleh memuat password, token, atau cookie. Gunakan logger Nest dengan level dari env.
- Endpoint `GET /health` (publik, cek koneksi DB) untuk smoke test.

---

## 6. FRONTEND — RUTE, STRUKTUR, DAN KUALITAS UI

- Struktur sesuai PRD bagian 19 (`features/auth`, `registration`, `profile`, `attendance`, `history`, `schedules`, `corrections`, `admin`).
- Semua halaman PRD bagian 12 harus ada dan terhubung: publik (login, registrasi, lupa/reset password, status pendaftaran), pengguna (dashboard, absensi, riwayat + detail, profil, koreksi, notifikasi), admin (dashboard, pendaftaran, pengguna, jadwal, absensi, koreksi, laporan, audit log, pengaturan sistem).
- Route guard di frontend hanyalah UX; keamanan sebenarnya di backend. Redirect sesuai role dan status akun.
- Data lewat TanStack Query (query key konsisten, invalidasi setelah mutasi). Form lewat React Hook Form + Zod resolver. Skema Zod frontend mencerminkan aturan backend (pesan Indonesia).
- Setiap halaman punya state **loading, empty, error, dan sukses** yang jelas. Aksi admin penting (setujui/tolak, tangguhkan, tutup jadwal, ekspor) memakai dialog konfirmasi. Status tidak hanya dibedakan warna (tambahkan teks/ikon).
- Tabel besar memakai pagination dari server dan filter sesuai PRD (tanggal, jenis, status, nama/NPM/kelas/sesi).
- Dashboard admin mengambil angka dari endpoint backend khusus (bukan menghitung dari data yang kebetulan termuat).
- Jangan ada komponen atau teks yang menyiratkan pengenalan wajah.

---

## 7. TAHAPAN DAN GERBANG VERIFIKASI

Kerjakan Tahap 1–10 dari PRD bagian 20. Di akhir **setiap** tahap jalankan dan pastikan lulus sebelum lanjut:

1. `npm install` bersih (tanpa error; peringatan peer dependency diselesaikan).
2. `prisma validate` dan migrasi berhasil pada DB bersih (`migrate reset` → `migrate deploy` → `seed`).
3. `typecheck` (`tsc --noEmit`) untuk web dan api: **0 error**.
4. `lint`: **0 error**.
5. Test yang relevan dengan tahap itu: **semua hijau**.
6. `build` web dan api berhasil.
7. Smoke test: jalankan api di background, `curl /api/v1/health` → OK, uji minimal satu endpoint tahap itu, matikan proses.
8. Commit.

Ringkasan isi per tahap (detail di PRD):
- **T1** Inisialisasi: monorepo, Vite+React+TS+Tailwind+shadcn, NestJS, Prisma+MySQL, docker-compose (MySQL+MinIO), `.env.example`, ESLint/Prettier, Vitest/Jest/Playwright terpasang, skrip root (`dev`, `build`, `test`, `lint`, `typecheck`, `db:migrate`, `db:seed`), health endpoint.
- **T2** Auth & registrasi: skema DB inti, register/login/logout/me/forgot/reset, sesi, guard, throttling, seed admin, approve/reject atomik, halaman terkait.
- **T3** Profil & dashboard: profil (+audit perubahan penting), dashboard user/admin, manajemen pengguna, status akun + pencabutan sesi, notifikasi.
- **T4** Jadwal & sesi: CRUD jadwal, publish (buat sesi), close, cancel, perhitungan `ACTIVE`, aturan terlambat, `SystemSetting`.
- **T5** Kamera/foto/lokasi: hook `useCamera`, `useGeolocation`, halaman absensi, pipeline gambar backend, storage service (S3/MinIO), util waktu.
- **T6** Check-in/out: endpoint, validasi berlapis, idempotensi, transaksi + kompensasi, status terlambat, precheck, halaman hasil.
- **T7** Riwayat & koreksi: riwayat + filter + detail + streaming foto, koreksi end-to-end, audit log + halaman audit.
- **T8** Laporan & ekspor CSV (aman dari CSV injection), filter laporan, ringkasan statistik.
- **T9** Pengujian & keamanan: lengkapi semua test (bagian 8), uji otorisasi, uji konkurensi, review checklist PRD bagian 16, perbaiki semua temuan.
- **T10** Deployment: `Dockerfile` api & web (multi-stage), `docker-compose.prod.example.yml`, panduan HTTPS/reverse proxy, backup & restore (skrip dump MySQL + catatan backup bucket) **diuji sekali**, `README` produksi.

---

## 8. PENGUJIAN (wajib nyata dan dijalankan, bukan hanya ditulis)

**Unit (Jest/Vitest):** validasi registrasi & password policy; fungsi penentu status absensi (tepat waktu, tepat di batas `lateAfter`, tepat di `checkInEndAt`, setelah ditutup, tiap kebijakan lokasi & keterlambatan, akurasi di atas ambang, koordinat tidak valid); konversi WIB↔UTC; validasi koordinat; mesin status koreksi/pendaftaran; sanitasi CSV; hook `useCamera`/komponen penting dengan mock `getUserMedia`.

**Integrasi (Jest + Supertest + MySQL & MinIO nyata):** registrasi → approve → login; akun PENDING/REJECTED/SUSPENDED tidak bisa absen; mass-assignment (`role: ADMIN`, `accountStatus: ACTIVE` pada registrasi diabaikan/ditolak); check-in sukses menyimpan record + evidence `STORED` + objek ada di storage; upload non-gambar/terlalu besar/korup ditolak; **kegagalan storage (mock client S3 melempar error) → tidak ada record, respons gagal**; **kegagalan DB setelah upload → objek dihapus**; idempotensi (key sama → record sama, objek tidak bertambah); duplikat dengan key berbeda → 409; **dua request check-in bersamaan (`Promise.all`) → tepat satu record**; check-out tanpa check-in ditolak; sesi ditutup/dibatalkan/di luar jendela ditolak; user lain tidak bisa melihat riwayat/foto user ini (404); user biasa memanggil `/admin/*` → 403; `userId` di body diabaikan; sesi dicabut saat suspend; approve ganda → konflik; koreksi approve tidak menimpa data asli + ada audit; ekspor CSV hanya berisi data yang diizinkan & aman dari injection; throttling login; audit log tercatat untuk aksi sensitif; job retensi menghapus foto kedaluwarsa dan endpoint foto mengembalikan `EVIDENCE_EXPIRED`.

**E2E (Playwright, Chromium):** gunakan kamera & GPS palsu — launch args `--use-fake-device-for-media-stream` dan `--use-fake-ui-for-media-stream`, context `permissions: ['camera','geolocation']`, `geolocation: { latitude: -6.2, longitude: 106.8, accuracy: 25 }`. Skenario minimum PRD 17.3 (daftar → admin setujui → login → absen check-in dengan foto → lihat riwayat → admin lihat catatan → ajukan koreksi → admin selesaikan) ditambah: izin kamera ditolak, izin lokasi ditolak (tiap kebijakan lokasi), jaringan putus lalu retry tanpa duplikat (`context.setOffline`), klik ganda, akun ditangguhkan, sesi ditutup, user buka data user lain, user panggil endpoint admin. Playwright memakai `webServer` + DB/storage test yang di-reset sebelum run.

Buat `docs/ACCEPTANCE_CHECKLIST.md`: salin seluruh checklist PRD bagian 16 dan isi tiap butir dengan nama test yang membuktikannya. Tidak boleh ada butir yang dicentang tanpa test/bukti.

---

## 9. DOKUMENTASI YANG HARUS ADA

`README.md` (prasyarat, cara menjalankan dari nol, perintah test, cara menguji kamera/lokasi di HP), `.env.example` (semua variabel PRD 18.2 + `SEED_ADMIN_*`, `LOCATION_*`, `MAX_UPLOAD_SIZE_MB`, `PHOTO_RETENTION_DAYS`, `SESSION_TTL_DAYS`, `DEFAULT_TIMEZONE=Asia/Jakarta`), `docs/API.md` (semua endpoint, contoh request/response, kode error), `docs/DATABASE.md` (ERD teks/mermaid + penjelasan constraint), `docs/DECISIONS.md`, `docs/ACCEPTANCE_CHECKLIST.md`, `docs/PRIVACY_AND_RETENTION.md` (data apa yang dikumpulkan, tujuan, akses, retensi, batasan teknis foto/lokasi sesuai PRD bagian 15).

Pengujian di HP: kamera & GPS di browser butuh HTTPS (kecuali `localhost`). Sediakan opsi dev HTTPS (mis. `@vitejs/plugin-basic-ssl` pada Vite dan proxy tetap ke api) dan dokumentasikan alternatif tunnel; jelaskan di README.

---

## 10. DEFINITION OF DONE

Selesai hanya jika SEMUA benar dan sudah kamu buktikan dengan menjalankannya:

- Dari repo bersih: `cp .env.example .env` → `docker compose up -d` → `npm install` → `npm run db:migrate` → `npm run db:seed` → `npm run dev` menjalankan web + api yang berfungsi penuh.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` (unit + integrasi) dan `npm run test:e2e` semua lulus dengan 0 error dan tanpa test yang di-skip.
- Seluruh butir PRD bagian 16 dan 24 terpenuhi dan terbukti di `docs/ACCEPTANCE_CHECKLIST.md`.
- Tidak ada kode face recognition, tabel wajah, geofence, `TODO`, mock di produksi, atau secret di repo.
- Foto tidak pernah dapat diakses tanpa otorisasi; timestamp resmi selalu dari server; absensi sukses palsu mustahil terjadi saat foto gagal tersimpan.
- Semua dokumen bagian 9 tersedia dan akurat.

---

## 11. FORMAT LAPORAN AKHIR

Setelah selesai (atau bila ada hal yang benar-benar tidak bisa dijalankan), laporkan singkat:
1. Ringkasan apa yang dibangun per tahap.
2. Hasil nyata tiap gerbang verifikasi (perintah + ringkasan hasil: jumlah test lulus/gagal).
3. Daftar keputusan penting di `docs/DECISIONS.md`.
4. Hal yang belum bisa diverifikasi di lingkunganmu beserta perintah persis untuk memverifikasinya.
5. Risiko/batasan yang masih ada (mis. foto/GPS tidak bisa dijamin anti-manipulasi sesuai PRD 15).

**Mulai sekarang:** (1) baca `docs/PRD.md` sampai habis, (2) tulis rencana kerja ringkas, (3) kerjakan Tahap 1 dan lewati gerbang verifikasinya, lalu lanjut berurutan sampai Tahap 10 tanpa menunggu persetujuan.
