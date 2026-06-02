// =============================================================
// Mango · src/recommendations/recommendations.controller.ts
// -------------------------------------------------------------
// GET  /recommendations?userId=:id  → lista para un cliente
// POST /recommendations             → crear (solo advisor)
// =============================================================

import {
  Controller, Get, Post, Body, Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Role } from '@prisma/client';

@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * GET /recommendations?userId=:id
   * Accesible por usuarios (solo propias) y asesores (solo asignados).
   */
  @Get()
  findByClient(
    @CurrentUser() user: { id: string; role: string },
    @Query('userId') userId: string,
  ) {
    return this.recommendationsService.findByClient(user.id, user.role, userId);
  }

  /**
   * POST /recommendations
   * Body: { userId, title, text }
   * Solo asesores. Response 201: Recommendation
   */
  @Post()
  @Roles(Role.ADVISOR)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateRecommendationDto,
  ) {
    return this.recommendationsService.create(user.id, dto);
  }
}
