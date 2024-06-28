import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { app } from '../firebase';
import { PrismaService } from 'src/Prisma.Service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly pService: PrismaService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    try {

      const accessToken = req.headers.authorization?.split(' ')[1];
      console.log(req.user);
      const decodedToken = await app.auth().verifyIdToken(accessToken);
      req.user = decodedToken;

      req.user.id = (
        await this.pService.user.findFirstOrThrow({
          where: {
            firebaseId: req.user.uid,
          },
          select: {
            id: true,
          },
        })
      )?.id;

   
      next();
    } catch (err) {
      // console.log('error-----------------',err);
      res.status(401).send('Unauthorized');
    }
  }
}
