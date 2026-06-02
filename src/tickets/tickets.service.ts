// =============================================================
// Mango · src/tickets/tickets.service.ts
// -------------------------------------------------------------
// Lógica de procesamiento de tickets / OCR.
//
// ESTADO ACTUAL: stub simulado.
// La función processTicket() devuelve datos de ejemplo aleatorios
// que replican exactamente la estructura que espera el frontend.
//
// PARA CONECTAR CON IA REAL:
//   1. Instalar el SDK de tu proveedor (ej: @google-cloud/vision,
//      openai, aws-sdk/client-textract).
//   2. Reemplazar el cuerpo de realOcr() con la llamada a la API.
//   3. Agregar las env vars necesarias en .env.
//
// El contrato de respuesta que espera el frontend (api.js):
//   { merchant, amount, category, date, confidence, description }
// =============================================================

import { Injectable } from '@nestjs/common';

export interface OcrResult {
  merchant:    string;
  amount:      number;
  category:    string;
  date:        string;
  confidence:  number;
  description: string;
}

@Injectable()
export class TicketsService {
  /** Muestra demo — fecha relativa a "hoy" en producción real. */
  private todayOffset(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /**
   * Procesa un ticket / imagen.
   * @param file — objeto Multer con el buffer de la imagen subida.
   *
   * ─── Para integrar OCR real ──────────────────────────────────
   * Descomenta el bloque `realOcr` y completá la lógica con tu
   * proveedor de IA. El método recibe `file.buffer` (Uint8Array).
   * ─────────────────────────────────────────────────────────────
   */
  async processTicket(file?: Express.Multer.File): Promise<OcrResult> {
    // ── Stub simulado ────────────────────────────────────────────
    const samples: OcrResult[] = [
      { merchant: 'Coto',          amount: 18470,  category: 'comida',      date: this.todayOffset(-2), confidence: 0.97, description: 'Importado desde ticket' },
      { merchant: 'YPF',           amount: 24500,  category: 'transporte',  date: this.todayOffset(-1), confidence: 0.95, description: 'Importado desde ticket' },
      { merchant: 'Farmacity',     amount: 9320,   category: 'salud',       date: this.todayOffset(0),  confidence: 0.92, description: 'Importado desde ticket' },
      { merchant: 'Mercado Libre', amount: 56990,  category: 'compras',     date: this.todayOffset(-4), confidence: 0.91, description: 'Importado desde ticket' },
      { merchant: 'Netflix',       amount: 4999,   category: 'entretenimiento', date: this.todayOffset(0), confidence: 0.99, description: 'Importado desde ticket' },
      { merchant: 'Edenor',        amount: 15200,  category: 'servicios',   date: this.todayOffset(-3), confidence: 0.94, description: 'Importado desde ticket' },
    ];

    const result = samples[Math.floor(Math.random() * samples.length)];

    // Simula latencia de procesamiento de IA
    await new Promise((r) => setTimeout(r, 600));

    return result;

    // ── Para activar OCR real, reemplazar el bloque de arriba ────
    //
    // return await this.realOcr(file.buffer, file.mimetype);
  }

  /**
   * Placeholder para integración con un proveedor de OCR/IA real.
   * Implementar según el SDK elegido.
   */
  // private async realOcr(buffer: Buffer, mimeType: string): Promise<OcrResult> {
  //   // Ejemplo con Google Cloud Vision:
  //   // const [result] = await visionClient.textDetection({ image: { content: buffer } });
  //   // const text = result.fullTextAnnotation?.text ?? '';
  //   // ... parsear text para extraer merchant, amount, date ...
  //   // return { merchant, amount, category: 'otros', date, confidence, description };
  //   throw new Error('OCR real no implementado aún.');
  // }
}
