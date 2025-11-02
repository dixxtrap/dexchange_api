import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';


const config = new DocumentBuilder()
  .setTitle('Kareos : Ecosystem Ipm')
  .setDescription('Backend Core for all prevention institue for desease')
  .setVersion('1.0').addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
  .setContact('Djiga Salane', 'https://www.linkedin.com/in/djiga-salane/', 'dakspro2007@gmail.com')
  .build();
export const documentFactory = (app) =>
  SwaggerModule.createDocument(app, config);
