// =============================================================
// Mango · src/consultations/consultations.controller.ts
// =============================================================

import {
  Controller, Get, Post, Patch,
  Param, Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { AnswerConsultationDto } from './dto/answer-consultation.dto';
import { Role } from '@prisma/client';

@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  /**
   * POST /consultations
   * Solo clientes. Crea una consulta para el asesor.
   */
  @Post()
  @Roles(Role.USER)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateConsultationDto,
  ) {
    return this.consultationsService.create(user.id, dto);
  }

  /**
   * GET /consultations/mine
   * Solo clientes. Devuelve las consultas propias con sus respuestas.
   */
  @Get('mine')
  @Roles(Role.USER)
  findMine(@CurrentUser() user: { id: string }) {
    return this.consultationsService.findMine(user.id);
  }

  /**
   * GET /consultations
   * Solo asesores. Devuelve todas las consultas de todos los clientes.
   */
  @Get()
  @Roles(Role.ADVISOR)
  findAll() {
    return this.consultationsService.findAll();
  }

  /**
   * PATCH /consultations/:id/answer
   * Solo asesores. Responde una consulta.
   * Body: { answer: string }
   */
  @Patch(':id/answer')
  @Roles(Role.ADVISOR)
  answer(
    @Param('id') id: string,
    @Body() dto: AnswerConsultationDto,
  ) {
    return this.consultationsService.answer(id, dto);
  }
}
