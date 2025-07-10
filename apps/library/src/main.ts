import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        'http://localhost',
        'https://library.paulkukowski.net',
        'https://multiverse-library-production.up.railway.app',
      ],
      preflightContinue: false,
      maxAge: 3600,
    },
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.set('query parser', 'extended');

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Multiverse Library')
    .setDescription(
      'Provides an API for filtering and visualizing Magic: the Gathering cards.'
    )
    .setVersion('0.1')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, doc);

  const port = process.env.PORT || 3000;
  await app.listen(port, '::');
  Logger.log(`Application is running on localhost:${port}/${globalPrefix}`);
}

bootstrap();
