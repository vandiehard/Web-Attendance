import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient, AccountStatus, AttendanceStatus, AttendanceType, CorrectionStatus, CorrectionType, LocationStatus, ScheduleStatus, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import sharp from 'sharp';

const prisma = new PrismaClient();
const demoPassword = 'DemoUser12345';
const localStorageDir = resolve(process.env.STORAGE_LOCAL_DIR ?? './storage/evidence');

async function upsertUser(email: string, password: string, status: AccountStatus, profile: { npm: string; fullName: string; className: string; phoneNumber: string }): Promise<{ id: string }> {
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await prisma.user.upsert({ where: { email }, update: { passwordHash: hash, accountStatus: status, role: UserRole.USER }, create: { email, passwordHash: hash, accountStatus: status, role: UserRole.USER, profile: { create: profile } } });
  await prisma.userProfile.upsert({ where: { userId: user.id }, update: profile, create: { userId: user.id, ...profile } });
  return user;
}

async function createEvidence(recordId: string, expiresAt: Date): Promise<void> {
  const image = await sharp({ create: { width: 320, height: 240, channels: 3, background: { r: 80, g: 105, b: 232 } } }).jpeg({ quality: 80 }).toBuffer();
  const key = `evidence/${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.jpg`;
  const target = resolve(localStorageDir, key);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, image);
  await prisma.attendanceEvidence.create({ data: { attendanceRecordId: recordId, objectKey: key, mimeType: 'image/jpeg', fileSizeBytes: image.length, sha256: createHash('sha256').update(image).digest('hex'), uploadedAt: new Date(), status: 'STORED', expiresAt } });
}

async function ensureRegistration(userId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', reason?: string): Promise<void> {
  const existing = await prisma.registrationRequest.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
  if (existing) { await prisma.registrationRequest.update({ where: { id: existing.id }, data: { status, pendingKey: status === 'PENDING' ? 'PENDING' : null, rejectionReason: reason ?? null } }); return; }
  await prisma.registrationRequest.create({ data: { userId, status, pendingKey: status === 'PENDING' ? 'PENDING' : null, rejectionReason: reason } });
}

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345';
  const adminHash = await argon2.hash(adminPassword, { type: argon2.argon2id });
  const admin = await prisma.user.upsert({ where: { email: adminEmail }, update: { role: UserRole.ADMIN, accountStatus: AccountStatus.ACTIVE, passwordHash: adminHash }, create: { email: adminEmail, role: UserRole.ADMIN, accountStatus: AccountStatus.ACTIVE, passwordHash: adminHash } });
  for (const [key, value] of [['LOCATION_POLICY', 'NEEDS_REVIEW'], ['LOCATION_MAX_ACCURACY_METERS', '100'], ['LATE_POLICY', 'ACCEPT_AS_LATE'], ['PHOTO_RETENTION_DAYS', '180']] as const) await prisma.systemSetting.upsert({ where: { key }, update: { value, updatedById: admin.id }, create: { key, value, updatedById: admin.id } });

  const active: { id: string }[] = [];
  for (let index = 1; index <= 6; index += 1) active.push(await upsertUser(`demo${index}@example.com`, demoPassword, AccountStatus.ACTIVE, { npm: `2026${String(index).padStart(3, '0')}`, fullName: `Demo Mahasiswa ${index}`, className: index % 2 === 0 ? 'TI-2B' : 'TI-2A', phoneNumber: `081230000${String(index).padStart(2, '0')}` }));
  const pendingUsers = await Promise.all([1, 2, 3].map((index) => upsertUser(`pending${index}@example.com`, demoPassword, AccountStatus.PENDING, { npm: `PEND${index}`, fullName: `Pendaftar Menunggu ${index}`, className: 'TI-2A', phoneNumber: `081240000${index}` })));
  for (const user of pendingUsers) await ensureRegistration(user.id, 'PENDING');
  const rejected = await upsertUser('rejected@example.com', demoPassword, AccountStatus.REJECTED, { npm: 'REJECT1', fullName: 'Akun Ditolak', className: 'TI-2A', phoneNumber: '0812500001' }); await ensureRegistration(rejected.id, 'REJECTED', 'Data pendaftaran belum memenuhi persyaratan.');
  const suspended = await upsertUser('suspended@example.com', demoPassword, AccountStatus.SUSPENDED, { npm: 'SUSPEND1', fullName: 'Akun Ditangguhkan', className: 'TI-2B', phoneNumber: '0812600001' }); await ensureRegistration(suspended.id, 'APPROVED');

  const now = new Date(); const openStart = new Date(now.getTime() - 3600000); const openEnd = new Date(now.getTime() + 3 * 3600000); const today = await prisma.schedule.upsert({ where: { id: 'demo-schedule-today' }, update: { status: ScheduleStatus.PUBLISHED, checkInStartAt: openStart, checkInEndAt: openEnd, checkOutStartAt: openStart, checkOutEndAt: openEnd, lateAfter: new Date(now.getTime() + 15 * 60000) }, create: { id: 'demo-schedule-today', name: 'Sesi Demo Hari Ini', description: 'Jendela absensi untuk presentasi.', checkInStartAt: openStart, checkInEndAt: openEnd, checkOutStartAt: openStart, checkOutEndAt: openEnd, lateAfter: new Date(now.getTime() + 15 * 60000), status: ScheduleStatus.PUBLISHED, createdById: admin.id } });
  const todaySession = await prisma.attendanceSession.upsert({ where: { scheduleId: today.id }, update: { status: ScheduleStatus.PUBLISHED }, create: { scheduleId: today.id, sessionDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), status: ScheduleStatus.PUBLISHED } });
  if (await prisma.attendanceRecord.count({ where: { sessionId: todaySession.id } }) === 0) { const record = await prisma.attendanceRecord.create({ data: { userId: active[0].id, sessionId: todaySession.id, type: AttendanceType.CHECK_IN, status: AttendanceStatus.PRESENT, serverTimestamp: now, receivedAt: now, latitude: -6.2, longitude: 106.8, accuracyMeters: 25, locationStatus: LocationStatus.AVAILABLE, idempotencyKey: randomUUID() } }); await createEvidence(record.id, new Date(now.getTime() + 180 * 86400000)); }
  const yesterday = new Date(now.getTime() - 86400000); const oldSchedule = await prisma.schedule.upsert({ where: { id: 'demo-schedule-yesterday' }, update: { status: ScheduleStatus.CLOSED }, create: { id: 'demo-schedule-yesterday', name: 'Sesi Demo Kemarin', description: 'Contoh riwayat absensi.', checkInStartAt: new Date(yesterday.getTime() - 3600000), checkInEndAt: yesterday, checkOutStartAt: yesterday, checkOutEndAt: new Date(yesterday.getTime() + 3600000), lateAfter: new Date(yesterday.getTime() - 1800000), status: ScheduleStatus.CLOSED, createdById: admin.id } });
  const oldSession = await prisma.attendanceSession.upsert({ where: { scheduleId: oldSchedule.id }, update: { status: ScheduleStatus.CLOSED }, create: { scheduleId: oldSchedule.id, sessionDate: new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate())), status: ScheduleStatus.CLOSED } });
  if (await prisma.attendanceRecord.count({ where: { sessionId: oldSession.id } }) === 0) for (let index = 0; index < 5; index += 1) { const record = await prisma.attendanceRecord.create({ data: { userId: active[index].id, sessionId: oldSession.id, type: AttendanceType.CHECK_IN, status: index === 1 ? AttendanceStatus.LATE : index === 2 ? AttendanceStatus.NEEDS_REVIEW : AttendanceStatus.PRESENT, serverTimestamp: new Date(yesterday.getTime() + index * 600000), receivedAt: new Date(yesterday.getTime() + index * 600000), latitude: index === 2 ? null : -6.2, longitude: index === 2 ? null : 106.8, accuracyMeters: index === 1 ? 180 : index === 2 ? null : 25, locationStatus: index === 1 ? LocationStatus.LOW_ACCURACY : index === 2 ? LocationStatus.UNAVAILABLE : LocationStatus.AVAILABLE, idempotencyKey: randomUUID() } }); await createEvidence(record.id, new Date(now.getTime() + 180 * 86400000)); }
  if (await prisma.attendanceCorrection.count() === 0) { const record = await prisma.attendanceRecord.findFirstOrThrow({ where: { sessionId: oldSession.id } }); await prisma.attendanceCorrection.create({ data: { userId: record.userId, attendanceRecordId: record.id, type: CorrectionType.OTHER, reason: 'Contoh koreksi yang menunggu tinjauan.' } }); await prisma.attendanceCorrection.create({ data: { userId: active[1].id, attendanceRecordId: record.id, type: CorrectionType.STATUS_CHANGE, reason: 'Contoh koreksi yang sudah disetujui.', status: CorrectionStatus.APPROVED, reviewedById: admin.id, reviewedAt: now, previousStatus: AttendanceStatus.LATE, newStatus: AttendanceStatus.PRESENT } }); }
  for (const user of [...active, ...pendingUsers]) await prisma.notification.create({ data: { userId: user.id, type: 'DEMO_INFO', title: 'Selamat datang di Attendly', message: 'Ini adalah notifikasi demo.' } }).catch(() => undefined);
  await prisma.auditLog.create({ data: { actorUserId: admin.id, action: 'DEMO_SEED', entityType: 'System', reason: 'Data demo dibuat.' } });
  console.info(`Admin: ${adminEmail} / ${adminPassword}`); console.info('User aktif: demo1@example.com / DemoUser12345'); console.info('User belum check-in: demo6@example.com / DemoUser12345'); console.info('User pending: pending1@example.com / DemoUser12345'); console.info('User rejected: rejected@example.com / DemoUser12345'); console.info('User suspended: suspended@example.com / DemoUser12345'); console.info(`Demo session: ${todaySession.id}`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
