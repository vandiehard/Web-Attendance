import { Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { normalize, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export abstract class StorageService { abstract put(key: string, buffer: Buffer, contentType: string): Promise<void>; abstract get(key: string): Promise<Readable>; abstract delete(key: string): Promise<void>; abstract exists(key: string): Promise<boolean>; }
const KEY = /^evidence\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/;

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly base = resolve(process.env.STORAGE_LOCAL_DIR ?? './storage/evidence');
  private path(key: string): string {
    if (!KEY.test(key)) throw new Error('Invalid storage key');
    const candidate = resolve(this.base, normalize(key));
    if (relative(this.base, candidate).startsWith('..')) throw new Error('Invalid storage path');
    return candidate;
  }
  async put(key: string, buffer: Buffer): Promise<void> { const target = this.path(key); await mkdir(resolve(target, '..'), { recursive: true }); const temp = `${target}.${process.pid}.tmp`; await writeFile(temp, buffer, { flag: 'wx' }); await rename(temp, target); }
  async get(key: string): Promise<Readable> { return createReadStream(this.path(key)); }
  async delete(key: string): Promise<void> { await rm(this.path(key), { force: true }); }
  async exists(key: string): Promise<boolean> { try { await stat(this.path(key)); return true; } catch { return false; } }
}

@Injectable()
export class S3StorageService extends StorageService {
  private readonly client = new S3Client({ region: process.env.STORAGE_REGION ?? 'auto', endpoint: process.env.STORAGE_ENDPOINT || undefined, forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true', credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY ?? '', secretAccessKey: process.env.STORAGE_SECRET_KEY ?? '' } });
  private readonly bucket = process.env.STORAGE_BUCKET ?? 'attendance';
  async put(key: string, buffer: Buffer, contentType: string): Promise<void> { await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType })); }
  async get(key: string): Promise<Readable> { const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key })); if (!result.Body) throw new Error('Object body missing'); return result.Body as Readable; }
  async delete(key: string): Promise<void> { await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key })); }
  async exists(key: string): Promise<boolean> { try { await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key })); return true; } catch { return false; } }
}
