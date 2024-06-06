import { Injectable } from '@nestjs/common';
import { PrismaService } from './Prisma.Service';

@Injectable()
export class AppService {
  constructor(private readonly pService: PrismaService) { }

  getHello() {
    return this.pService.user.findMany()
  }
}
