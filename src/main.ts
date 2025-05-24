import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { ContextInterceptor } from './common/context/context.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT;

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(reflector),
    new ContextInterceptor(),
  );
  await app.listen(PORT);
}
bootstrap();
