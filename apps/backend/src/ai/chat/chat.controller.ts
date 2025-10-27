import {
  Controller,
  HttpException,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Readable } from 'stream';
import { ChatService } from './chat.service'; // Servisi import et

@Controller('/ai/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  // 1. ConfigService yerine ChatService'i enjekte et
  constructor(private readonly chatService: ChatService) {}

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

    try {
      // 2. Tüm proxy mantığı için servisi çağır
      const providerResponse = await this.chatService.proxyRequest(
        targetUrl,
        clientRequest,
      );

      // 3. Sağlayıcıdan gelen HATA yanıtını işle
      // Servis, fetch'in 'ok' olup olmadığını kontrol etmez,
      // böylece controller, sağlayıcının hata mesajını stream edebilir.
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

      // 4. Sağlayıcıdan gelen BAŞARILI yanıtı işle (stream)
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

      // 5. Stream'i istemciye pipe et
      if (providerResponse.body) {
        // @ts-ignore
        const nodeStream = Readable.fromWeb(providerResponse.body);
        nodeStream.pipe(clientResponse);
      } else {
        clientResponse.end();
      }
    } catch (error) {
      // 6. Servisten fırlatılan (örn: 403 Forbidden) veya beklenmedik hataları yakala
      this.logger.error(`AI proxy hatası: ${error.message}`, error.stack);

      if (clientResponse.headersSent) {
        return; // Yanıt zaten gönderildiyse bir şey yapma
      }

      // Servisten gelen NestJS hatalarını (ForbiddenException vb.) düzgün işle
      if (error instanceof HttpException) {
        clientResponse.status(error.getStatus()).json(error.getResponse());
      } else {
        clientResponse.status(500).json({
          message: 'AI proxy hatası',
          error: error.message || 'Bilinmeyen proxy hatası',
        });
      }
    }
  }
}
