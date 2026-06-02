// =============================================================
// Mango · src/common/decorators/roles.decorator.ts
// -------------------------------------------------------------
// @Roles('ADVISOR') marca los endpoints que solo pueden
// usar asesores. Trabaja en conjunto con RolesGuard.
// =============================================================

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Decora un handler o controller con los roles permitidos. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
