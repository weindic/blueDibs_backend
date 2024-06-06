import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { json, urlencoded } from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb' }));
    const options:CorsOptions = {
        origin: ['http://localhost:8100'], // Specify allowed origin(s)
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
        exposedHeaders: ['Authorization'], // Specify exposed headers (if needed)
        credentials: true, // Allow credentials (e.g., cookies and authorization headers)
        optionsSuccessStatus: 200, // Success status for preflight OPTIONS requests
    }
    // Enable CORS with specific options
    app.enableCors(options);

    console.log(process.env.PORT)
    await app.listen(parseInt(process.env.PORT as string));
}

bootstrap();
