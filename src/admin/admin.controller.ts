import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';

@Controller('admin')
export class AdminController {
  constructor(private readonly pService: PrismaService) {}

  @Get('transaction/all/:userId')
 async getAllTransactionByUserUserId(@Param('userId') userid, @Headers() headers){
    if(headers['x-api_key'] != 'cf6ffb04-0ea3-435a-84e9-07410ed15a08')
      throw new UnauthorizedException('api key invalid')
    
    const txns = await this.pService.transaction.findMany({
      where: {
        OR: [{
          buyer_id: userid,
          
        }, {seller_id: userid}]
      },
      include: {
        buyerUser: {
          select: {
            id: true,
            username: true
          }
        },
        sellerUser: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

   return txns.map((txn) => {
      const user_txn: typeof txn & {type: 'BUY' | 'SELL'} = {...txn, type: 'BUY'}

      if(txn.seller_id == userid){
        // means user sold the share
        user_txn.type = 'BUY';
      }

      return user_txn
    })
  }
}
