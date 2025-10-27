import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  // 1. API anahtarları ve ayarlar servis katmanına taşındı
  private googleApiKey: string;
  private groqApiKey: string;

  private readonly allowedHosts = [
    'https://generativelanguage.googleapis.com',
    'https://api.groq.com',
  ];

  constructor(private readonly configService: ConfigService) {
    // 2. Constructor, servis başlatıldığında ayarları yükler
    this.googleApiKey = this.configService.get<string>('GOOGLE_API_KEY');
    this.groqApiKey = this.configService.get<string>('GROQ_API_KEY');

    // Başlangıç kontrolleri
    if (this.googleApiKey) {
      this.logger.log('Google API Anahtarı yüklendi.');
    } else {
      this.logger.warn('GOOGLE_API_KEY bulunamadı.');
    }

    if (this.groqApiKey) {
      this.logger.log('Groq API Anahtarı yüklendi.');
    } else {
      this.logger.warn('GROQ_API_KEY bulunamadı.');
    }

    if (!this.googleApiKey && !this.groqApiKey) {
      this.logger.error(
        'Hiçbir AI API anahtarı (GOOGLE veya GROQ) bulunamadı!',
      );
      throw new Error(
        'Gerekli AI API anahtarları eksik. Uygulama başlatılamıyor.',
      );
    }
  }

  /**
   * Gelen isteği hedef AI sağlayıcısına yönlendirir.
   * @param targetUrl Yönlendirilecek hedef URL
   * @param clientRequest Gelen Express 'Request' objesi
   * @returns Sağlayıcıdan gelen 'fetch' 'Response' objesi
   */
  async proxyRequest(
    targetUrl: string,
    clientRequest: Request,
  ): Promise<Response> {
    // 3. Güvenlik kontrolü serviste yapılır
    if (!this.allowedHosts.some((host) => targetUrl.startsWith(host))) {
      this.logger.warn(`İzin verilmeyen host'a proxy denemesi: ${targetUrl}`);
      // Controller'ın yakalaması için NestJS hatası fırlat
      throw new ForbiddenException('Forbidden target host');
    }

    this.logger.log(`AI proxy isteği alındı. Hedef URL: ${targetUrl}`);

    // 4. Header hazırlama mantığı serviste
    const headers = this.prepareHeaders(clientRequest.headers);

    // 5. API anahtarı ekleme mantığı serviste
    this.addApiKeyToHeaders(headers, targetUrl);

    // 6. Fetch işlemi serviste yapılır
    return fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(clientRequest.body),
    });
  }

  /**
   * Gelen header'ları temizler ve 'fetch' için hazırlar.
   */
  private prepareHeaders(incomingHeaders: Request['headers']): Headers {
    const headers = new Headers();
    const ignoreKeys = [
      'host',
      'cookie',
      'x-csrf-token',
      'content-length',
      'origin',
      'accept-encoding',
    ];

    Object.entries(incomingHeaders).forEach(([key, value]) => {
      if (ignoreKeys.includes(key.toLowerCase())) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value) {
        headers.set(key, value as string);
      }
    });

    return headers;
  }

  /**
   * Hedef URL'ye göre doğru API anahtarını header'lara ekler.
   */
  private addApiKeyToHeaders(headers: Headers, targetUrl: string): void {
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
      headers.set('Authorization', `Bearer ${this.groqApiKey}`);
    } else {
      this.logger.error(`Bu URL için API anahtarı bulunamadı: ${targetUrl}`);
      throw new InternalServerErrorException(
        'Provider için API anahtarı bulunamadı.',
      );
    }
  }
}
