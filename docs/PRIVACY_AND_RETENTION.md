# Privasi dan Retensi

Sistem mengumpulkan identitas akun, profil, foto bukti, timestamp server, metadata timestamp perangkat, dan koordinat/akurasi yang dilaporkan browser hanya untuk administrasi absensi. Tidak ada pencocokan wajah, template biometrik, liveness, atau pelacakan lokasi terus-menerus.

Foto disimpan privat dengan object key acak, diproses ulang menjadi JPEG maksimal 1280px dan metadata EXIF dibuang. Akses melalui streaming endpoint yang memeriksa sesi dan kepemilikan/role. Default retensi foto 180 hari (`PHOTO_RETENTION_DAYS`), metadata absensi tetap dipertahankan; implementasi job penghapus harus dijadwalkan di production. Koordinat tidak pernah dipakai sebagai geofence dan ditampilkan sebagai “dilaporkan perangkat”.

Operator wajib membatasi akses admin, mengamankan env, mengaktifkan HTTPS, serta mencadangkan database dan storage sesuai kebijakan organisasi/hukum yang berlaku.
