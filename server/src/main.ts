import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './config/data-source';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { getCorsFromEnv } from './shared/utils/cors.util';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const pendingMigrations = await AppDataSource.showMigrations();

    if (pendingMigrations) {
      await AppDataSource.runMigrations();
    }

    const app = await NestFactory.create(AppModule);

    app.enableShutdownHooks();

    app.use(helmet());
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    const { origins, methods, allowedHeaders } = getCorsFromEnv();
    app.enableCors({
      origin: origins,
      methods,
      allowedHeaders,
      credentials: true,
    });

    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);

    const config = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE || 'AFSO API')
      .setDescription(
        process.env.SWAGGER_DESCRIPTION || 'Adaptive Field Service Orchestrator API',
      )
      .setVersion(process.env.SWAGGER_VERSION || '1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
