// =============================================================
// Mango · src/auth/strategies/jwt.strategy.ts
// -------------------------------------------------------------
// Passport JWT Strategy: extrae el Bearer token del header
// Authorization, lo verifica con JWT_SECRET y adjunta el
// payload al request.user.
// =============================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'mango-super-secret-jwt-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException('Token inválido.');
    return {
      id:    payload.sub,
      email: payload.email,
      name:  payload.name,
      role:  payload.role,
    };
  }
}
