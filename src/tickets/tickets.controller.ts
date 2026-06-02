// =============================================================
// Mango · src/tickets/tickets.controller.ts
// -------------------------------------------------------------
// POST /tickets/upload
// Recibe una imagen como multipart/form-data (campo "file")
// y devuelve los datos extraídos por OCR.
//
// Compatibilidad con el frontend (api.js):
//   uploadTicket: (file) => request('POST', '/tickets/upload',
//     { filename: file && file.name })
//
// NOTA: el frontend actualmente envía JSON con { filename }.
// Este controller acepta AMBOS casos:
//   - multipart/form-data con campo "file" (correcto para archivos reales)
//   - application/json con { filename } (mock del frontend)
// =============================================================

import {
  Controller, Post, UploadedFile,
  UseInterceptors, UseGuards, HttpCode, HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * POST /tickets/upload
   *
   * Acepta multipart/form-data con campo "file" (imagen del ticket).
   * También funciona sin archivo (devuelve stub igualmente).
   *
   * Response 200:
   * {
   *   merchant: string,
   *   amount: number,
   *   category: string,
   *   date: string,       // YYYY-MM-DD
   *   confidence: number, // 0–1
   *   description: string
   * }
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // máx 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /image\/(jpeg|png|webp|gif|bmp)|application\/pdf/;
        if (allowed.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de archivo no soportado. Usá imágenes o PDF.'), false);
        }
      },
    }),
  )
  uploadTicket(
    @UploadedFile() file?: Express.Multer.File,
    @Body() _body?: any,
  ) {
    // El stub no usa el archivo pero lo recibe para cuando se integre OCR real
    return this.ticketsService.processTicket(file);
  }
}
