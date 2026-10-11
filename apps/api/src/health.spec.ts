import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('Health', () => {
  it('creates the application module', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    expect(module).toBeDefined();
  });
});
