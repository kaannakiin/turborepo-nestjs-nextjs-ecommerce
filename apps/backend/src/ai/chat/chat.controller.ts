import {
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Readable } from 'stream';

@Controller('/ai/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  // 1. Tüm API anahtarlarını constructor'da yükle
  private googleApiKey: string;
  private groqApiKey: string;

  // İzin verilen host'ları tek bir yerde yönet
  private allowedHosts = [
    'https://generativelanguage.googleapis.com',
    'https://api.groq.com',
    // Gelecekte eklerseniz: 'https://api.anthropic.com'
  ];

  constructor(private readonly configService: ConfigService) {
    this.googleApiKey = this.configService.get<string>('GOOGLE_API_KEY');
    this.groqApiKey = this.configService.get<string>('GROQ_API_KEY');

    // Hangi anahtarların yüklendiğini logla (opsiyonel ama faydalı)
    if (this.googleApiKey) this.logger.log('Google API Anahtarı yüklendi.');
    if (this.groqApiKey) this.logger.log('Groq API Anahtarı yüklendi.');

    if (!this.googleApiKey && !this.groqApiKey) {
      this.logger.error(
        'Hiçbir AI API anahtarı (GOOGLE veya GROQ) bulunamadı!',
      );
    }
  }

  @Post()
  async chatProxy(
    @Req() clientRequest: Request,
    @Res() clientResponse: Response,
    @Query('url') targetUrl: string,
  ) {
    if (!targetUrl) {
      return clientResponse
        .status(400)
        .json({ error: 'url query param required' });
    }

    // 2. Güvenlik Kontrolünü Dinamik Hale Getir
    if (!this.allowedHosts.some((host) => targetUrl.startsWith(host))) {
      this.logger.warn(`İzin verilmeyen host'a proxy denemesi: ${targetUrl}`);
      return clientResponse
        .status(403)
        .json({ error: 'Forbidden target host' });
    }

    try {
      this.logger.log(`AI proxy isteği alındı. Hedef URL: ${targetUrl}`);

      // 3. Giden İstek Başlıklarını Hazırla
      const headers = new Headers();
      Object.entries(clientRequest.headers).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();

        // Hono'nun 'proxyFetch' örneğindeki gibi 'origin' ve 'accept-encoding'i de filtrele
        if (
          lowerKey === 'host' ||
          lowerKey === 'cookie' ||
          lowerKey === 'x-csrf-token' ||
          lowerKey === 'content-length' ||
          lowerKey === 'origin' ||
          lowerKey === 'accept-encoding'
        ) {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else if (value) {
          headers.set(key, value as string);
        }
      });

      // 4. API Anahtarını Dinamik Olarak Ayarla (En Önemli Değişiklik)
      if (targetUrl.startsWith('https://generativelanguage.googleapis.com')) {
        if (!this.googleApiKey) {
          throw new InternalServerErrorException(
            'Google API anahtarı ayarlanmamış.',
          );
        }
        headers.set('x-goog-api-key', this.googleApiKey);
      } else if (targetUrl.startsWith('https://api.groq.com')) {
        if (!this.groqApiKey) {
          throw new InternalServerErrorException(
            'Groq API anahtarı ayarlanmamış.',
          );
        }
        // Hono'daki 'getProviderInfo' mantığı: Groq 'Authorization: Bearer' kullanır
        headers.set('Authorization', `Bearer ${this.groqApiKey}`);
      } else {
        // Bu durum 'allowedHosts' kontrolü sayesinde olmamalı, ama
        // güvenlik için bir kontrol daha
        this.logger.error(`Bu URL için API anahtarı bulunamadı: ${targetUrl}`);
        throw new InternalServerErrorException(
          'Provider için API anahtarı bulunamadı.',
        );
      }

      // 5. Hedef API'ye fetch at
      const providerResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(clientRequest.body),
      });

      // 6. Gelen Yanıtı Kontrol Et (Hata Yakalama)
      if (!providerResponse.ok) {
        const errorBody = await providerResponse.text();
        this.logger.error(
          `Provider API Hatası: ${providerResponse.status} ${providerResponse.statusText}`,
        );
        this.logger.error(`Provider Hata Yanıtı: ${errorBody}`);

        providerResponse.headers.forEach((value, key) => {
          clientResponse.setHeader(key, value);
        });
        clientResponse.status(providerResponse.status).send(errorBody);
        return;
      }

      // 7. Başarılı Yanıt Başlıklarını Kopyala
      const ignoreHeaders = [
        'content-encoding',
        'content-length',
        'strict-transport-security',
      ];

      providerResponse.headers.forEach((value, key) => {
        if (!ignoreHeaders.includes(key.toLowerCase())) {
          clientResponse.setHeader(key, value);
        }
      });

      clientResponse.status(providerResponse.status);

      // 8. Stream'i Başlat
      if (providerResponse.body) {
        // @ts-ignore
        const nodeStream = Readable.fromWeb(providerResponse.body);
        nodeStream.on('data', (chunk: Buffer) => {
          this.logger.log(`STREAM VERİSİ ALINDI: ${chunk.toString()}`);
        });
        nodeStream.pipe(clientResponse);
      } else {
        clientResponse.end();
      }
    } catch (error) {
      this.logger.error(`AI proxy hatası: ${error.message}`, error.stack);
      if (!clientResponse.headersSent) {
        clientResponse.status(500).json({
          message: 'AI proxy hatası',
          error: error.message || 'Bilinmeyen proxy hatası',
        });
      }
    }
  }
}
