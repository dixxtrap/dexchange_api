import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/helper/exception_catch';
import { SwaggerModule } from '@nestjs/swagger';
import { documentFactory } from './common/helper/swagger_config';
import { ConfigService } from '@nestjs/config';
import { validationConfig } from './common/helper/validation_pipe_config';
process.loadEnvFile()
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      // compact: true,
    }),
  });
  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new HttpExceptionFilter());
  SwaggerModule.setup('v1/documentation', app as INestApplication, documentFactory(app));
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>("APP_PORT", 3000), () => {
    console.log(`=========================app is running on ${configService.get("APP_PORT")}=========================`)
  });
}
bootstrap();
