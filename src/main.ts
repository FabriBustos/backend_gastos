// =============================================================
// Mango · src/main.ts — Bootstrap de la aplicación
// =============================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ─────────────────────────────────────────────────────
  // Permite cualquier origen en dev. En producción, setear
  // CORS_ORIGIN con la URL del frontend.
  const origin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: origin !== '*',
  });

  // ── Validación global ─────────────────────────────────────────
  // whitelist: elimina campos no declarados en los DTOs
  // transform: convierte automáticamente los tipos (string → number, etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filtro global de excepciones ──────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`\n🥭 Mango API corriendo en: http://localhost:${port}\n`);
}

bootstrap();
