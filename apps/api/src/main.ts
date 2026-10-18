import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, CallHandler, Catch, ExecutionContext, ExceptionFilter, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import helmet from 'helmet';
import * as cookieParserModule from 'cookie-parser';
import { AppModule } from './app.module';
import { sanitizeResponse } from './common/sanitize';
const cookieParser = ('default' in cookieParserModule ? cookieParserModule.default : cookieParserModule) as typeof import('cookie-parser');

@Injectable()
class SensitiveDataInterceptor implements NestInterceptor { intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> { return next.handle().pipe(map((value: unknown) => sanitizeResponse(value))); } }

@Catch()
class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void { const response = host.switchToHttp().getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>(); const status = exception instanceof HttpException ? exception.getStatus() : 500; const value = exception instanceof HttpException ? exception.getResponse() : undefined; const body = typeof value === 'object' && value !== null && 'code' in value ? value : { code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR', message: status === 500 ? 'Terjadi kesalahan pada server.' : 'Permintaan tidak dapat diproses.' }; response.status(status).json({ success: false, error: body }); }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); app.use(cookieParser()); app.setGlobalPrefix('api/v1'); app.use((request: { method: string; headers: Record<string, string | undefined> }, response: { status: (code: number) => { json: (body: unknown) => void } }, next: () => void) => { if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) && (!request.headers['x-requested-with'] || request.headers.origin !== (process.env.APP_BASE_URL ?? 'http://localhost:5173'))) return response.status(403).json({ success: false, error: { code: 'CSRF_REQUIRED', message: 'Header keamanan wajib disertakan.' } }); next(); }); app.useGlobalInterceptors(new SensitiveDataInterceptor()); app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(Number(process.env.PORT ?? 3000));
}
void bootstrap();
