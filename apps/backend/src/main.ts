import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie'leri isteklerden ayrıştırmak için cookie-parser'ı etkinleştirin.
  // Bu, request.cookies üzerinden erişim sağlar.
  app.use(cookieParser());

  const configService = app.get<ConfigService>(ConfigService);

  // Çevre değişkenine göre izin verilen kaynakları belirle.
  // Bu liste, frontend uygulamanızın çalıştığı tüm URL'leri içermelidir.
  const allowedOrigins =
    configService.get<string>('NODE_ENV') === 'production'
      ? [
          'https://terravivashop.com', // Ana frontend domain'iniz
          'https://www.terravivashop.com', // www ile ana frontend domain'iniz
          // 'https://api.terravivashop.com', // Backend'in kendi domain'i genellikle origin olarak eklenmez
          // çünkü kendi kendisine istek yapmaz.
          // Ancak eğer backend'iniz bir client gibi davranıp başka bir
          // endpoint'ine istek yapıyorsa (ki bu nadirdir), ekleyebilirsiniz.
          // Normal bir senaryoda bu satıra gerek yoktur.
        ]
      : [
          'http://localhost:3000', // Next.js geliştirme ortamı (varsayılan)
          'http://127.0.0.1:3000', // Next.js geliştirme ortamı (alternatif IP)
        ];

  // Geliştirme veya üretim ortamında hangi origin'lerin kullanıldığını görmek için konsola yazdır.
  console.log('Allowed CORS Origins:', allowedOrigins);
  console.log('Environment:', configService.get<string>('NODE_ENV'));

  // CORS politikalarını etkinleştir.
  app.enableCors({
    origin: allowedOrigins, // İzin verilen kaynak listesi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // İzin verilen HTTP metotları
    allowedHeaders: ['Content-Type', 'Authorization'], // İstemciden gelen isteklere izin verilen başlıklar
    credentials: true, // Bu ÇOK ÖNEMLİ: Tarayıcının çerezleri cross-origin isteklerle göndermesine izin verir.
    // Hem frontend'den backend'e hem de backend'den frontend'e Set-Cookie başlığının
    // doğru şekilde işlenmesini sağlar.
  });

  // Uygulamanın dinleyeceği portu ve IP adresini belirt.
  // '0.0.0.0' tüm ağ arayüzlerinden erişimi sağlar, production ortamı için iyidir.
  await app.listen(configService.get<number>('PORT') ?? 3001, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log('All config:', configService.get('DOMAIN')); // Tüm config değerlerini göster
}
bootstrap();
