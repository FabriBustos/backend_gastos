// =============================================================
// Mango · src/users/users.controller.ts
// -------------------------------------------------------------
// GET /users   → clientes asignados al asesor autenticado
// PUT /me      → actualizar perfil del usuario autenticado
// =============================================================

import {
  Controller, Get, Put, Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Solo accesible por asesores.
   * Retorna los clientes que tiene asignados el asesor autenticado.
   */
  @Get('users')
  @Roles(Role.ADVISOR)
  listClients(@CurrentUser() user: { id: string }) {
    return this.usersService.findAssignedClients(user.id);
  }

  /**
   * PUT /me
   * Body: { name?, phone?, city? }
   * Response 200: usuario actualizado (sin password)
   */
  @Put('me')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
