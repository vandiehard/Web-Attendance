import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParserModule from 'cookie-parser';

const cookieParser = ('default' in cookieParserModule ? cookieParserModule.default : cookieParserModule) as typeof import('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
