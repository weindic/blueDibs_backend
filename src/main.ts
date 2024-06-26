import { NestFactory } from '@nestjs/core';
import {  AppModuleexport } from './app.module'; // Correct import of AppModule

import * as admin from 'firebase-admin'; // Import Firebase Admin if needed
import { json, urlencoded } from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';


async function bootstrap() {
  const app = await NestFactory.create(AppModuleexport);

  // Firebase Admin initialization if needed
  // admin.initializeApp();

  // Middleware for handling JSON and URL encoded data
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));

  // CORS configuration
  const options: CorsOptions = {
    origin: ['http://localhost:8100'], // Specify allowed origin(s)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    exposedHeaders: ['Authorization'], // Specify exposed headers (if needed)
    credentials: true, // Allow credentials (e.g., cookies and authorization headers)
    optionsSuccessStatus: 200, // Success status for preflight OPTIONS requests
  };

  // Enable CORS with specific options
  app.enableCors(options);

  // Read and use environment variable for port, fallback to 3000 if not set
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
