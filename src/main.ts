import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');

  // Configure Swagger OpenAPI
  const swaggerOpts = new DocumentBuilder()
    .setTitle('Eat or Pass - REST API')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
}
bootstrap();
