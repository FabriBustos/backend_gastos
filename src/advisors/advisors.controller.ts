// =============================================================
// Mango · src/advisors/advisors.controller.ts
// -------------------------------------------------------------
// GET    /advisor/clients            → ver mis clientes asignados
// POST   /advisor/clients            → asignar un nuevo cliente
// DELETE /advisor/clients/:clientId  → desasignar un cliente
//
// Todos los endpoints requieren rol ADVISOR.
// =============================================================

import {
  Controller, Get, Post, Delete,
  Param, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdvisorsService } from './advisors.service';
import { AssignClientDto } from './dto/assign-client.dto';
import { Role } from '@prisma/client';

@Controller('advisor/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISOR)
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  /**
   * GET /advisor/clients
   * Lista los clientes asignados al asesor autenticado.
   */
  @Get()
  listAssignments(@CurrentUser() user: { id: string }) {
    return this.advisorsService.listAssignments(user.id);
  }

  /**
   * POST /advisor/clients
   * Body: { clientId }
   * Asigna un nuevo cliente al asesor.
   * Response 201: { assignmentId, assignedAt, client }
   */
  @Post()
  assignClient(
    @CurrentUser() user: { id: string },
    @Body() dto: AssignClientDto,
  ) {
    return this.advisorsService.assignClient(user.id, dto);
  }

  /**
   * DELETE /advisor/clients/:clientId
   * Desasigna un cliente del asesor.
   * Response 204: sin body
   */
  @Delete(':clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignClient(
    @Param('clientId') clientId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.advisorsService.unassignClient(user.id, clientId);
  }
}
