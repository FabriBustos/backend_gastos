// =============================================================
// Mango · src/consultations/dto/answer-consultation.dto.ts
// =============================================================

import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AnswerConsultationDto {
  @IsString()
  @IsNotEmpty({ message: 'La respuesta no puede estar vacía.' })
  @MinLength(10, { message: 'La respuesta debe tener al menos 10 caracteres.' })
  answer: string;
}
