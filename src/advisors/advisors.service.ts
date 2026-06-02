// =============================================================
// Mango · src/advisors/advisors.service.ts
// -------------------------------------------------------------
// Gestión de asignaciones asesor ↔ cliente.
//
// Endpoints que habilita:
//   GET    /advisor/clients          → ver mis clientes asignados
//   POST   /advisor/clients          → asignar un nuevo cliente
//   DELETE /advisor/clients/:clientId → desasignar un cliente
//
// Reglas:
//  • Solo asesores usan este módulo.
//  • El clientId debe existir y ser de rol USER.
//  • No se puede asignar el mismo cliente dos veces.
// =============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignClientDto } from './dto/assign-client.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdvisorsService {
  constructor(private prisma: PrismaService) {}

  private toPublicUser(user: {
    id: string; name: string; email: string; role: string;
    phone: string; city: string; joinedAt: Date;
  }) {
    return {
      id:     user.id,
      name:   user.name,
      email:  user.email,
      role:   user.role.toLowerCase(),
      phone:  user.phone,
      city:   user.city,
      joined: user.joinedAt.toISOString().slice(0, 10),
    };
  }

  /** Lista los clientes asignados al asesor. */
  async listAssignments(advisorId: string) {
    const assignments = await this.prisma.advisorAssignment.findMany({
      where: { advisorId },
      include: { client: true },
      orderBy: { assignedAt: 'desc' },
    });
    return assignments.map((a) => ({
      assignmentId: a.id,
      assignedAt:   a.assignedAt.toISOString(),
      client:       this.toPublicUser(a.client),
    }));
  }

  /** Asigna un cliente al asesor. */
  async assignClient(advisorId: string, dto: AssignClientDto) {
    // Verificar que el cliente exista y sea USER
    const client = await this.prisma.user.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Usuario no encontrado.');
    if (client.role !== Role.USER) {
      throw new BadRequestException('Solo podés asignar usuarios con rol cliente.');
    }

    // Verificar que no esté ya asignado
    const existing = await this.prisma.advisorAssignment.findFirst({
      where: { advisorId, clientId: dto.clientId },
    });
    if (existing) throw new ConflictException('Ese cliente ya está asignado a vos.');

    const assignment = await this.prisma.advisorAssignment.create({
      data: { advisorId, clientId: dto.clientId },
      include: { client: true },
    });

    return {
      assignmentId: assignment.id,
      assignedAt:   assignment.assignedAt.toISOString(),
      client:       this.toPublicUser(assignment.client),
    };
  }

  /** Desasigna un cliente del asesor. */
  async unassignClient(advisorId: string, clientId: string) {
    const assignment = await this.prisma.advisorAssignment.findFirst({
      where: { advisorId, clientId },
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada.');

    await this.prisma.advisorAssignment.delete({ where: { id: assignment.id } });
  }
}
