import { NestFactory } from '@nestjs/core';
import {  AppModuleexport } from './app.module'; // Correct import of AppModule

import * as admin from 'firebase-admin'; // Import Firebase Admin if needed
import { NextFunction, Response, json, urlencoded } from 'express';
import { Request } from 'node-mailjet';




async function bootstrap() {

  
  const app = await NestFactory.create(AppModuleexport);

  // Firebase Admin initialization if needed
  // admin.initializeApp();

  // Middleware for handling JSON and URL encoded data
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));


  app.use(function (request: Request, response: Response, next: NextFunction) {
    response.setHeader('Access-Control-Allow-Origin',   'https://localhost');
    next();
  });

  app.enableCors({
    origin: ['http://localhost:8100', 'https://localhost'], // Adjust this to match the origin of your Ionic app
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true
  });




  // Read and use environment variable for port, fallback to 3000 if not set
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
