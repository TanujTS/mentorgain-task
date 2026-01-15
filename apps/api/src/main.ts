import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove properties not in dto
      transform: true, // payload to dto instances
      forbidNonWhitelisted: true, // Throw error if unknown properties sent
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || origin === process.env.WEB_URL) {
        callback(null, true);
      } else {
        console.warn(`Blocked request from unknown origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
