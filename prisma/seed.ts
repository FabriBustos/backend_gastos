// =============================================================
// Mango · prisma/seed.ts
// -------------------------------------------------------------
// Crea los usuarios demo + gastos de muestra + asignaciones
// de asesor. Las contraseñas se hashean con bcrypt.
//
// Ejecutar con: npm run db:seed
// =============================================================

import { PrismaClient, Category, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function pick<T>(arr: T[], r: () => number): T { return arr[Math.floor(r() * arr.length)]; }
function between(min: number, max: number, r: () => number): number {
  return Math.round(min + r() * (max - min));
}

const CATEGORIES = ['COMIDA','TRANSPORTE','SERVICIOS','ENTRETENIMIENTO','SALUD','COMPRAS','EDUCACION','OTROS'] as Category[];

const MERCHANTS: Record<string, string[]> = {
  COMIDA:          ['Coto','Carrefour','Disco','La Anónima','Rappi','PedidosYa','Havanna','Starbucks'],
  TRANSPORTE:      ['YPF','Shell','Axion','SUBE','Cabify','Uber','Estación Subte'],
  SERVICIOS:       ['Edenor','Metrogas','Aysa','Movistar','Personal','Telecentro','Fibertel'],
  ENTRETENIMIENTO: ['Netflix','Spotify','Disney+','Cinemark','Steam','HBO Max'],
  SALUD:           ['Farmacity','Farmacia del Pueblo','OSDE','Swiss Medical','Galeno'],
  COMPRAS:         ['Mercado Libre','Falabella','Frávega','Garbarino','Dexter','Zara'],
  EDUCACION:       ['Coursera','Platzi','UTN','Librería Cúspide','Domestika'],
  OTROS:           ['Mercado Pago','Banco Galicia','Western Union','Kiosco'],
};

const RANGES: Record<string, [number, number]> = {
  COMIDA: [2500,28000], TRANSPORTE: [1200,18000], SERVICIOS: [6000,42000],
  ENTRETENIMIENTO: [2400,9500], SALUD: [3000,55000], COMPRAS: [8000,120000],
  EDUCACION: [9000,60000], OTROS: [1500,35000],
};

const DESCRIPTIONS: Record<string, string[]> = {
  COMIDA: ['Compra semanal','Almuerzo','Cena con amigos','Café','Delivery','Supermercado'],
  TRANSPORTE: ['Carga de nafta','Carga SUBE','Viaje','Peaje','Estacionamiento'],
  SERVICIOS: ['Factura mensual','Abono internet','Plan celular','Luz','Gas'],
  ENTRETENIMIENTO: ['Suscripción mensual','Entradas cine','Juego','Streaming'],
  SALUD: ['Farmacia','Cuota prepaga','Consulta','Medicamentos'],
  COMPRAS: ['Compra online','Ropa','Electrodoméstico','Regalo','Calzado'],
  EDUCACION: ['Curso online','Cuota facultad','Libros','Material de estudio'],
  OTROS: ['Transferencia','Comisión','Varios','Gasto eventual'],
};

function buildExpenses(
  userId: string,
  seed: number,
  perMonth: number,
  recentBias: boolean,
): Array<{ userId: string; merchant: string; category: Category; amount: number; date: string; description: string }> {
  const r = seeded(seed);
  const out: any[] = [];
  const now = new Date(2026, 4, 28); // 28 May 2026 — fecha fija para demo estable

  for (let m = 5; m >= 0; m--) {
    const count = perMonth + between(-2, 3, r);
    for (let i = 0; i < count; i++) {
      const cat = pick(CATEGORIES, r);
      const day = between(1, 27, r);
      const d = new Date(now.getFullYear(), now.getMonth() - m, day);
      const [lo, hi] = RANGES[cat];
      let amount = between(lo, hi, r);
      if (recentBias && m === 0 && r() > 0.82) amount = Math.round(amount * (2.4 + r()));
      out.push({
        userId,
        merchant: pick(MERCHANTS[cat], r),
        category: cat as Category,
        amount,
        date: d.toISOString().slice(0, 10),
        description: pick(DESCRIPTIONS[cat], r),
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Seed principal ─────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed de Mango...\n');

  const SALT_ROUNDS = 10;
  const hash = (pw: string) => bcrypt.hash(pw, SALT_ROUNDS);

  // Limpiar tablas en orden (respeta FK)
  await prisma.advisorAssignment.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Tablas limpiadas');

  // ── Usuarios ──────────────────────────────────────────────────
  const [juan, sofia, martin, lucia, valeria] = await Promise.all([
    prisma.user.create({ data: {
      id: 'u1', name: 'Juan Pérez',      email: 'juan@mango.app',
      password: await hash('123456'), role: Role.USER,
      phone: '+54 11 5555 1234', city: 'Buenos Aires',
      joinedAt: new Date('2024-08-12'),
    }}),
    prisma.user.create({ data: {
      id: 'u2', name: 'Sofía Ramírez',   email: 'sofia@mango.app',
      password: await hash('123456'), role: Role.USER,
      phone: '+54 11 5555 8821', city: 'Córdoba',
      joinedAt: new Date('2024-10-03'),
    }}),
    prisma.user.create({ data: {
      id: 'u3', name: 'Martín Gómez',    email: 'martin@mango.app',
      password: await hash('123456'), role: Role.USER,
      phone: '+54 11 5555 4410', city: 'Rosario',
      joinedAt: new Date('2025-01-20'),
    }}),
    prisma.user.create({ data: {
      id: 'u4', name: 'Lucía Fernández', email: 'lucia@mango.app',
      password: await hash('123456'), role: Role.USER,
      phone: '+54 11 5555 9077', city: 'Mendoza',
      joinedAt: new Date('2025-03-11'),
    }}),
    prisma.user.create({ data: {
      id: 'a1', name: 'Valeria Soto',    email: 'asesor@mango.app',
      password: await hash('123456'), role: Role.ADVISOR,
      phone: '+54 11 5555 0001', city: 'Buenos Aires',
      joinedAt: new Date('2024-05-01'),
    }}),
  ]);
  console.log('👤 Usuarios creados: Juan, Sofía, Martín, Lucía, Valeria (asesor)');

  // ── Gastos ────────────────────────────────────────────────────
  const allExpenses = [
    ...buildExpenses(juan.id,    4231, 11, true),
    ...buildExpenses(sofia.id,   9988,  9, true),
    ...buildExpenses(martin.id,  1507, 13, false),
    ...buildExpenses(lucia.id,   7321,  7, true),
  ];
  await prisma.expense.createMany({ data: allExpenses });
  console.log(`💸 ${allExpenses.length} gastos creados`);

  // ── Asignaciones de asesor ────────────────────────────────────
  // Valeria (asesor) tiene asignados a Juan y Sofía por defecto
  await prisma.advisorAssignment.createMany({
    data: [
      { advisorId: valeria.id, clientId: juan.id },
      { advisorId: valeria.id, clientId: sofia.id },
    ],
  });
  console.log('🔗 Asignaciones: Valeria → Juan, Sofía');

  // ── Recomendaciones de ejemplo ────────────────────────────────
  await prisma.recommendation.createMany({
    data: [
      {
        userId: juan.id, authorId: valeria.id,
        title: 'Revisá tu gasto en entretenimiento',
        text: 'Tus suscripciones mensuales suman más del 15% de tus ingresos estimados. Te recomiendo revisar cuáles realmente usás y cancelar las que no.',
      },
      {
        userId: juan.id, authorId: valeria.id,
        title: 'Excelente mes en Comida',
        text: 'Este mes lograste bajar el gasto en delivery un 30% respecto al mes anterior. ¡Seguí así!',
      },
      {
        userId: sofia.id, authorId: valeria.id,
        title: 'Atención con los gastos en Compras',
        text: 'Detecté tres compras grandes en el último mes. Considerá armar un fondo de emergencia antes de seguir comprando artículos no esenciales.',
      },
    ],
  });
  console.log('📝 3 recomendaciones de ejemplo creadas');

  console.log('\n✅ Seed completado exitosamente.\n');
  console.log('📋 Cuentas demo:');
  console.log('   👤 juan@mango.app    / 123456  (user)');
  console.log('   👤 sofia@mango.app   / 123456  (user)');
  console.log('   👤 martin@mango.app  / 123456  (user)');
  console.log('   👤 lucia@mango.app   / 123456  (user)');
  console.log('   🎓 asesor@mango.app  / 123456  (advisor)\n');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
