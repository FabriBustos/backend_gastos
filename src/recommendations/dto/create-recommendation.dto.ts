// =============================================================
// Mango · src/recommendations/dto/create-recommendation.dto.ts
// =============================================================

import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRecommendationDto {
  @IsString()
  @IsNotEmpty({ message: 'El userId del cliente es requerido.' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'El título es requerido.' })
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El texto es requerido.' })
  @MinLength(10, { message: 'El texto debe tener al menos 10 caracteres.' })
  @MaxLength(1000)
  text: string;
}
