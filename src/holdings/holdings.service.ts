import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';

@Injectable()
export class HoldingService {
  constructor(private readonly pService: PrismaService) {}

  async getUserHoldings(userId: string) {
    const holdings = await this.pService.holding.findMany({
      where: {
        buyerUser: {
          id: userId,
        },
      },
      include: {
        sellerUser: {
          select: { id: true, price: true, username: true },
        },
      },
    });

    return holdings.map((item) => ({
      ...item,
      value: item.amount * item.sellerUser.price,
    }));
  }
}
