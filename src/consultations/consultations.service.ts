// =============================================================
// Mango · src/consultations/consultations.service.ts
// =============================================================

import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { AnswerConsultationDto } from './dto/answer-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  private format(c: any) {
    return {
      id:         c.id,
      userId:     c.userId,
      question:   c.question,
      answer:     c.answer ?? null,
      answeredAt: c.answeredAt ? c.answeredAt.toISOString() : null,
      createdAt:  c.createdAt.toISOString(),
      user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email } : undefined,
    };
  }

  /** Cliente crea una consulta. */
  async create(userId: string, dto: CreateConsultationDto) {
    const consultation = await this.prisma.consultation.create({
      data: { userId, question: dto.question.trim() },
    });
    return this.format(consultation);
  }

  /** Cliente ve SUS consultas (con respuestas si las hay). */
  async findMine(userId: string) {
    const consultations = await this.prisma.consultation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return consultations.map(this.format);
  }

  /** Asesor ve TODAS las consultas de todos los clientes. */
  async findAll() {
    const consultations = await this.prisma.consultation.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return consultations.map(this.format);
  }

  /** Asesor responde una consulta. */
  async answer(consultationId: string, dto: AnswerConsultationDto) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });
    if (!consultation) throw new NotFoundException('Consulta no encontrada.');
    if (consultation.answer) throw new ForbiddenException('Esta consulta ya fue respondida.');

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        answer:     dto.answer.trim(),
        answeredAt: new Date(),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return this.format(updated);
  }
}
