// =============================================================
// Mango · src/expenses/dto/update-expense.dto.ts
// =============================================================

import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

/** Todos los campos de CreateExpenseDto se vuelven opcionales. */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
