// =============================================================
// Mango · src/users/users.service.ts
// -------------------------------------------------------------
// GET /users  → lista de usuarios (solo asesores)
//              Retorna solo los clientes ASIGNADOS al asesor.
// PUT /me     → actualiza nombre, teléfono y ciudad del perfil.
// =============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Formato público del usuario (sin password). Compatible con el frontend. */
  private toPublic(user: {
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

  /**
   * Lista los clientes asignados al asesor.
   * Solo retorna usuarios con role=USER que estén en advisor_assignments.
   */
  async findAssignedClients(advisorId: string) {
    const assignments = await this.prisma.advisorAssignment.findMany({
      where: { advisorId },
      include: { client: true },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => this.toPublic(a.client));
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Responde con el objeto usuario actualizado (sin password).
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name  !== undefined && { name:  dto.name.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
        ...(dto.city  !== undefined && { city:  dto.city.trim() }),
      },
    });

    return this.toPublic(updated);
  }
}
