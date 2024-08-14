import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { config } from './swaggerConfig'

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

   


    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors();
    app.useGlobalPipes(new ValidationPipe());

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document,{
      jsonDocumentUrl: 'swagger/json',
    });
    await app.listen(3000 ,()=>  console.log("server starrted "));
}
bootstrap();
