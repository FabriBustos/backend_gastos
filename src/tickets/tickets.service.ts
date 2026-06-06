// =============================================================
// Mango · src/tickets/tickets.service.ts
// -------------------------------------------------------------
// Procesa imágenes de tickets usando Gemini 1.5 Flash (Google).
// Extrae: merchant, amount, category, date, confidence, description.
//
// Contrato de respuesta (NO modificar — el frontend lo espera):
//   { merchant, amount, category, date, confidence, description }
// =============================================================

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface OcrResult {
  merchant:    string;
  amount:      number;
  category:    string;
  date:        string;       // YYYY-MM-DD
  confidence:  number;       // 0–1
  description: string;
}

// Categorías válidas que maneja el frontend
const VALID_CATEGORIES = [
  'comida',
  'transporte',
  'salud',
  'entretenimiento',
  'servicios',
  'compras',
  'educacion',
  'otros',
] as const;

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  /**
   * Procesa un ticket mediante Gemini.
   * Si no hay archivo o falla la API, devuelve un fallback seguro.
   */
  async processTicket(file?: Express.Multer.File): Promise<OcrResult> {
    if (!file?.buffer) {
      this.logger.warn('No se recibió archivo — devolviendo fallback.');
      return this.fallback();
    }

    try {
      return await this.callGemini(file.buffer, file.mimetype);
    } catch (err) {
      this.logger.error('Error al llamar a Gemini API:', err?.message ?? err);
      return this.fallback();
    }
  }

  // ── Llamada a Gemini ──────────────────────────────────────────

  private async callGemini(buffer: Buffer, mimeType: string): Promise<OcrResult> {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    const validMime = supportedTypes.includes(mimeType) ? mimeType : 'image/jpeg';

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Sos un sistema de OCR especializado en tickets y facturas de Argentina.

Analizá la imagen y extraé la siguiente información en formato JSON.

Estructura requerida:
{
  "merchant": "nombre del comercio o establecimiento",
  "amount": 1234.56,
  "category": "una de: comida, transporte, salud, entretenimiento, servicios, compras, educacion, otros",
  "date": "YYYY-MM-DD",
  "confidence": 0.95,
  "description": "descripción breve del gasto"
}

Reglas:
- "merchant": el nombre del local, supermercado, empresa, etc. Si no se ve claramente, poné "Comercio".
- "amount": el total a pagar en pesos argentinos, como número sin símbolos. Si hay varios totales, usá el más grande (total final). Si no se ve, poné 0.
- "category": elegí la más apropiada de la lista. Supermercados o tiendas de comida → comida. Combustible/peajes/SUBE → transporte. Farmacia/médico → salud. Streaming/cine/juegos → entretenimiento. Luz/gas/agua/internet/teléfono → servicios. Ropa/electrónica/hogar → compras. Universidad/cursos/libros → educacion. Cualquier otra → otros.
- "date": fecha del ticket en formato YYYY-MM-DD. Si no se ve, usá la fecha de hoy: ${new Date().toISOString().slice(0, 10)}.
- "confidence": tu nivel de confianza en los datos extraídos, entre 0 y 1.
- "description": una frase corta describiendo la compra (ej: "Compra en supermercado", "Carga de combustible").`;

    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: validMime,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return this.parseResponse(text);
  }

  // ── Parser de respuesta ───────────────────────────────────────

  private parseResponse(text: string): OcrResult {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.logger.warn('No se pudo parsear la respuesta de Gemini:', text);
      return this.fallback();
    }

    // Validar y sanitizar cada campo
    const merchant = typeof parsed.merchant === 'string' && parsed.merchant.trim()
      ? parsed.merchant.trim()
      : 'Comercio';

    const amount = typeof parsed.amount === 'number' && parsed.amount > 0
      ? Math.round(parsed.amount * 100) / 100
      : 0;

    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'otros';

    const date = /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
      ? parsed.date
      : new Date().toISOString().slice(0, 10);

    const confidence = typeof parsed.confidence === 'number'
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.8;

    const description = typeof parsed.description === 'string' && parsed.description.trim()
      ? parsed.description.trim()
      : 'Importado desde ticket';

    return { merchant, amount, category, date, confidence, description };
  }

  // ── Fallback seguro ───────────────────────────────────────────

  private fallback(): OcrResult {
    return {
      merchant:    'Comercio',
      amount:      0,
      category:    'otros',
      date:        new Date().toISOString().slice(0, 10),
      confidence:  0,
      description: 'No se pudo leer el ticket automáticamente.',
    };
  }
}
