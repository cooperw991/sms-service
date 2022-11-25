import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { NestConfig } from '@/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { loggerConfig } from '@/logger/logger.config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });
  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');

  await app.listen(nestConfig.port, '0.0.0.0', () => {
    Logger.log(`Api server started on: http://localhost:${nestConfig.port}`);
  });
}
bootstrap();
