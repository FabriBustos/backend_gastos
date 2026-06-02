// =============================================================
// Mango · src/expenses/expenses.service.ts
// -------------------------------------------------------------
// CRUD de gastos. Las reglas de negocio clave:
//
//  • Un usuario solo puede ver/editar/borrar SUS propios gastos.
//  • Un asesor puede listar gastos de cualquier usuario que
//    tenga asignado (GET con ?userId= en el query).
//  • El amount se almacena tal como lo envía el frontend (entero,
//    pesos ARS sin decimales). El frontend los muestra formateados.
// =============================================================

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  // ── Helpers ─────────────────────────────────────────────────

  /** Formato de gasto que espera el frontend. */
  private format(e: any) {
    return {
      id:          e.id,
      userId:      e.userId,
      merchant:    e.merchant,
      category:    e.category.toLowerCase(), // frontend usa minúsculas
      amount:      e.amount,
      date:        e.date,
      description: e.description,
    };
  }

  /** Verifica que el gasto exista y que el usuario sea su dueño. */
  private async findOwned(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('No se encontró el gasto.');
    if (expense.userId !== userId) throw new ForbiddenException('No podés modificar un gasto ajeno.');
    return expense;
  }

  // ── Métodos públicos ─────────────────────────────────────────

  /**
   * Lista gastos:
   *  - Usuario (role=USER): siempre sus propios gastos.
   *  - Asesor (role=ADVISOR): los de un cliente asignado (userId query param).
   *    Si no se pasa userId, devuelve array vacío.
   */
  async findAll(
    requesterId: string,
    requesterRole: string,
    targetUserId?: string,
  ) {
    let userId: string;

    if (requesterRole === 'advisor') {
      if (!targetUserId) return []; // asesor sin filtro → vacío (seguridad)

      // Verificar que el cliente esté asignado a este asesor
      const assignment = await this.prisma.advisorAssignment.findFirst({
        where: { advisorId: requesterId, clientId: targetUserId },
      });
      if (!assignment) throw new ForbiddenException('Ese cliente no está asignado a vos.');

      userId = targetUserId;
    } else {
      userId = requesterId;
    }

    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return expenses.map(this.format);
  }

  /** Crea un gasto para el usuario autenticado. */
  async create(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        merchant:    dto.merchant.trim(),
        category:    dto.category,
        amount:      dto.amount,
        date:        dto.date,
        description: (dto.description ?? '').trim(),
      },
    });
    return this.format(expense);
  }

  /** Actualiza un gasto. Solo el dueño puede hacerlo. */
  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    await this.findOwned(id, userId);

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.merchant    !== undefined && { merchant: dto.merchant.trim() }),
        ...(dto.category    !== undefined && { category: dto.category }),
        ...(dto.amount      !== undefined && { amount: dto.amount }),
        ...(dto.date        !== undefined && { date: dto.date }),
        ...(dto.description !== undefined && { description: dto.description.trim() }),
      },
    });
    return this.format(updated);
  }

  /** Elimina un gasto. Solo el dueño puede hacerlo. */
  async remove(id: string, userId: string) {
    await this.findOwned(id, userId);
    await this.prisma.expense.delete({ where: { id } });
  }
}
