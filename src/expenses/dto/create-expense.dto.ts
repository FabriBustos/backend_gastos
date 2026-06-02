// =============================================================
// Mango · src/expenses/dto/create-expense.dto.ts
// =============================================================

import {
  IsEnum, IsInt, IsNotEmpty, IsString, IsPositive,
  Matches, IsOptional, MaxLength,
} from 'class-validator';
import { Category } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty({ message: 'El comercio es requerido.' })
  @MaxLength(120)
  merchant: string;

  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsEnum(Category, { message: 'Categoría inválida.' })
  category: Category;

  @IsInt({ message: 'El monto debe ser un número entero (en centavos).' })
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  amount: number;

  /** Fecha en formato ISO YYYY-MM-DD */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD.' })
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
