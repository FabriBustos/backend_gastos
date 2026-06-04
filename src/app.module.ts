// =============================================================
// Mango · src/app.module.ts — Módulo raíz
// =============================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdvisorsModule } from './advisors/advisors.module';
import { ConsultationsModule } from './consultations/consultations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ExpensesModule,
    TicketsModule,
    UsersModule,
    RecommendationsModule,
    AdvisorsModule,
    ConsultationsModule,
  ],
})
export class AppModule {}
