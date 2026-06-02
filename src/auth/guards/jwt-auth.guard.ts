// =============================================================
// Mango · src/auth/guards/jwt-auth.guard.ts
// -------------------------------------------------------------
// Guard que activa la estrategia JWT de Passport.
// Usar con @UseGuards(JwtAuthGuard) en controllers/handlers.
// =============================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
