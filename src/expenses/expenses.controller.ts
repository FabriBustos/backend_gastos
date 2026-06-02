// =============================================================
// Mango · src/expenses/expenses.controller.ts
// -------------------------------------------------------------
// GET    /expenses            → lista (usuario: propios; asesor: ?userId=)
// POST   /expenses            → crear gasto
// PUT    /expenses/:id        → editar gasto
// DELETE /expenses/:id        → eliminar gasto (204)
// =============================================================

import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * GET /expenses
   * GET /expenses?userId=:id   (solo advisors)
   */
  @Get()
  findAll(
    @CurrentUser() user: { id: string; role: string },
    @Query('userId') userId?: string,
  ) {
    return this.expensesService.findAll(user.id, user.role, userId);
  }

  /**
   * POST /expenses
   * Body: CreateExpenseDto
   * Response 201: Expense
   */
  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(user.id, dto);
  }

  /**
   * PUT /expenses/:id
   * Body: UpdateExpenseDto (campos opcionales)
   * Response 200: Expense actualizado
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, user.id, dto);
  }

  /**
   * DELETE /expenses/:id
   * Response 204: sin body
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.remove(id, user.id);
  }
}
