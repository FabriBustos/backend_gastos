// =============================================================
// Mango · src/consultations/dto/create-consultation.dto.ts
// =============================================================

import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía.' })
  @MinLength(10, { message: 'La consulta debe tener al menos 10 caracteres.' })
  question: string;
}
