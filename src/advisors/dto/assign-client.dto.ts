// =============================================================
// Mango · src/advisors/dto/assign-client.dto.ts
// =============================================================

import { IsNotEmpty, IsString } from 'class-validator';

export class AssignClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El clientId es requerido.' })
  clientId: string;
}
