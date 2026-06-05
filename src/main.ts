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
  // Acepta cualquier origen (wildcard) para evitar bloqueos en
  // Railway y desarrollo local. credentials: false es requerido
  // cuando origin es '*' (restricción del estándar CORS).
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
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
  await app.listen(port, '0.0.0.0');
  console.log(`\n🥭 Mango API corriendo en el puerto ${port}\n`);
}

bootstrap();
