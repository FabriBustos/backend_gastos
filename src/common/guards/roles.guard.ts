// =============================================================
// Mango · src/common/guards/roles.guard.ts
// -------------------------------------------------------------
// Verifica que el usuario autenticado tenga uno de los roles
// declarados con @Roles(). Debe usarse DESPUÉS de JwtAuthGuard.
// =============================================================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se declaró @Roles(), el endpoint no tiene restricción de rol
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRole = user?.role?.toUpperCase();
    if (!requiredRoles.includes(userRole as Role)) {
      throw new ForbiddenException('No tenés acceso a esa sección.');
    }
    return true;
  }
}
