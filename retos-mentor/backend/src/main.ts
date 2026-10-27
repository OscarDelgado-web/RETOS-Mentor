import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync } from 'node:fs';
import { setGlobalProxyFromEnv } from 'node:http';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
} else if (existsSync('../.env')) {
  process.loadEnvFile('../.env');
}

const hasProxyConfiguration = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy']
  .some((name) => Boolean(process.env[name]?.trim()));
if (process.env.NODE_USE_ENV_PROXY === '1' || hasProxyConfiguration) {
  setGlobalProxyFromEnv();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
