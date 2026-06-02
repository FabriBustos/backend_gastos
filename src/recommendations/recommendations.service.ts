// =============================================================
// Mango · src/recommendations/recommendations.service.ts
// -------------------------------------------------------------
// GET /recommendations?userId=:id  → lista de recomendaciones
//                                    para un cliente (asesor o cliente)
// POST /recommendations            → crear recomendación (solo asesores)
//
// Reglas:
//  • El asesor solo puede recomendar a sus clientes asignados.
//  • El usuario solo puede ver SUS propias recomendaciones.
// =============================================================

import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  private format(r: any) {
    return {
      id:        r.id,
      userId:    r.userId,
      authorId:  r.authorId,
      title:     r.title,
      text:      r.text,
      author:    r.author?.name ?? '',
      createdAt: r.createdAt.toISOString(),
    };
  }

  /**
   * Retorna las recomendaciones de un cliente.
   *  - Usuario: solo puede ver las suyas (userId debe coincidir).
   *  - Asesor: solo puede ver las de sus clientes asignados.
   */
  async findByClient(
    requesterId: string,
    requesterRole: string,
    targetUserId: string,
  ) {
    if (!targetUserId) {
      throw new BadRequestException('Parámetro userId requerido.');
    }

    if (requesterRole === 'user' && requesterId !== targetUserId) {
      throw new ForbiddenException('No podés ver recomendaciones ajenas.');
    }

    if (requesterRole === 'advisor') {
      const assignment = await this.prisma.advisorAssignment.findFirst({
        where: { advisorId: requesterId, clientId: targetUserId },
      });
      if (!assignment) throw new ForbiddenException('Ese cliente no está asignado a vos.');
    }

    const recs = await this.prisma.recommendation.findMany({
      where: { userId: targetUserId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return recs.map(this.format);
  }

  /**
   * Crea una recomendación. Solo asesores.
   * El cliente debe estar asignado al asesor.
   */
  async create(advisorId: string, dto: CreateRecommendationDto) {
    const assignment = await this.prisma.advisorAssignment.findFirst({
      where: { advisorId, clientId: dto.userId },
    });
    if (!assignment) {
      throw new ForbiddenException('Solo podés recomendar a clientes que tenés asignados.');
    }

    const rec = await this.prisma.recommendation.create({
      data: {
        userId:   dto.userId,
        authorId: advisorId,
        title:    dto.title.trim(),
        text:     dto.text.trim(),
      },
      include: { author: { select: { name: true } } },
    });

    return this.format(rec);
  }
}
