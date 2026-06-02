// =============================================================
// Mango · src/auth/auth.service.ts
// -------------------------------------------------------------
// Lógica de autenticación:
//  - login: verifica credenciales con bcrypt, emite JWT
//  - register: crea usuario con contraseña hasheada, emite JWT
//
// La respuesta SIEMPRE incluye { token, user } para que sea
// compatible con lo que espera el frontend en api.js:
//   const { token, user } = await App.api.login(email, pass)
// =============================================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ── Helpers ─────────────────────────────────────────────────

  /** Mapea un usuario de Prisma al objeto público que espera el frontend. */
  private toPublicUser(user: {
    id: string; name: string; email: string; role: string;
    phone: string; city: string; joinedAt: Date;
  }) {
    return {
      id:     user.id,
      name:   user.name,
      email:  user.email,
      role:   user.role.toLowerCase(),       // frontend maneja "user"/"advisor" en minúsculas
      phone:  user.phone,
      city:   user.city,
      joined: user.joinedAt.toISOString().slice(0, 10), // "YYYY-MM-DD"
    };
  }

  /** Firma el JWT con el payload mínimo necesario por el frontend. */
  private signToken(user: { id: string; email: string; name: string; role: string }) {
    return this.jwt.sign({
      sub:   user.id,
      email: user.email,
      name:  user.name,
      role:  user.role.toLowerCase(),
    });
  }

  // ── login ───────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    return {
      token: this.signToken(user),
      user:  this.toPublicUser(user),
    };
  }

  // ── register ─────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (exists) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name:     dto.name.trim(),
        email:    dto.email.toLowerCase().trim(),
        password: hashed,
        // role por defecto: USER (definido en el schema)
      },
    });

    return {
      token: this.signToken(user),
      user:  this.toPublicUser(user),
    };
  }
}
