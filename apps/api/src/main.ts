import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: (origin, callback) => {
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
bootstrap();
