import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { PrismaService } from 'src/Prisma.Service';

const buySchema = z.object({
  amount: z.number(),
  type: z.string(),
  buyer_id: z.string(),
});

const sellSchema = z.object({
  amount: z.number(),
});

class buyDTO extends createZodDto(buySchema) {}
class sellDTO extends createZodDto(sellSchema) {}

@Controller('holding')
export class HoldingsController {
  constructor(private readonly pService: PrismaService) {}

  @Get()
  async getUserHoldings(@Req() req) {
    const holdings = await this.pService.holding.findMany({
      where: {
        buyerUser: {
          id: req.user.id,
        },
      },
      include: {
        sellerUser: true,
      },
    });

    return holdings.map((item) => ({
      ...item,
      value: item.amount * item.sellerUser.price,
    }));
  }

  @Post('buy/:userId')
  async buy(@Param('userId') userId: string, @Body() body: buyDTO, @Req() req) {
    const seller_user = await this.pService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        Sold: true,
      },
    });
  
    if (!seller_user)
      throw new HttpException('Seller User not found', HttpStatus.NOT_FOUND);
  
    const sharesAmountSold: number = seller_user?.Sold.reduce((prev, cur) => {
      return prev + cur.amount;
    }, 0) as number;
  
    if (seller_user?.shares - sharesAmountSold < body.amount) {
      throw new HttpException(
        "Doesn't have this amount of shares left",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  
    const amountToPay = body.amount * seller_user.price;
    const totalAmountToPay = amountToPay + (amountToPay * 0.2) / 100;
  
    // buyer
    const buyer = await this.pService.user.findFirst({
      where: {
        id: body.buyer_id,
      },
    });
  
   

    
    if (body.type !== 'refferal') {
      if (totalAmountToPay > (buyer?.balance || 0))
        throw new HttpException('Not enough balance', HttpStatus.FORBIDDEN);
  
      /**
       *  @description  Wallet deduct & 0.2 increment on seller wallet
       */
      const deductTxn = this.pService.user.update({
        where: {
          id: buyer?.id,
        },
        data: {
          balance: {
            decrement: totalAmountToPay,
          },
        },
      });
  
      const createHolding = this.pService.holding.upsert({
        where: {
          buyer_id_seller_id: {
            seller_id: userId,
            buyer_id: body.buyer_id,
          },
        },
        create: {
          investedInr: amountToPay,
          seller_id: userId,
          buyer_id: body.buyer_id,
          amount: body.amount,
          type: body.type, 
        },
        update: {
          amount: {
            increment: body.amount,
          },
          investedInr: {
            increment: amountToPay,
          },
          type: body.type,
        },
      });
  
      const newPrice = seller_user.price + amountToPay / seller_user.shares;
  
      const mutatePrice = this.pService.user.update({
        where: {
          id: seller_user.id,
        },
        data: {
          price: newPrice,
        },
      });
  
      const txn = this.pService.transaction.create({
        data: {
          buyer_id: body.buyer_id,
          seller_id: userId,
          amount: body.amount,
          newPrice,
          price: seller_user.price,
          type: body.type, // Ensure type is provided
        },
      });
  
      await this.pService.$transaction([
        createHolding,
        mutatePrice,
        txn,
        deductTxn,
      ]);
    } else {

      const refferal = await this.pService.referralWallet.findFirst({
        where: {
          userId: body.buyer_id,
        },
      });

      console.log('djhdjsdjshjds',refferal)
  
      

      if (totalAmountToPay > (refferal?.balance || 0))
        throw new HttpException('Not enough balance', HttpStatus.FORBIDDEN);
  
      const deductTxn = this.pService.referralWallet.update({
        where: {
          userId: body.buyer_id,
        },
        data: {
          balance: {
            decrement: totalAmountToPay,
          },
        },
      });
  
      const createHolding = this.pService.holding.upsert({
        where: {
          buyer_id_seller_id: {
            seller_id: userId,
            buyer_id:body.buyer_id,
          },
        },
        create: {
          investedInr: amountToPay,
          seller_id: userId,
          buyer_id:body.buyer_id,
          amount: body.amount,
          type: body.type, 
        },
        update: {
          amount: {
            increment: body.amount,
          },
          investedInr: {
            increment: amountToPay,
          },
          type: body.type,
        },
      });
  
      const newPrice = seller_user.price + amountToPay / seller_user.shares;
  
      const mutatePrice = this.pService.user.update({
        where: {
          id: seller_user.id,
        },
        data: {
          price: newPrice,
        },
      });
  
      const txn = this.pService.transaction.create({
        data: {
          buyer_id: body.buyer_id,
          seller_id: userId,
          amount: body.amount,
          newPrice,
          price: seller_user.price,
          type: body.type, // Ensure type is provided
        },
      });
  
      await this.pService.$transaction([
        createHolding,
        mutatePrice,
        txn,
        deductTxn,
      ]);
    }
  
    return { status: true, message: 'Transaction successful' };
  }
  
  

  @Post('sell/:userId')
  async sell(@Param('userId') userId, @Body() body: sellDTO, @Req() req) {
    const share_owner = await this.pService.user.findFirst({
      where: {
        id: userId,
      },
    });
  
    if (!share_owner)
      throw new HttpException('Seller user not found', HttpStatus.NOT_FOUND);
  
    const cur_usr_hld_amnt = await this.pService.holding.findUnique({
      where: {
        buyer_id_seller_id: {
          seller_id: share_owner?.id,
          buyer_id: req.user.id,
        },
      },
    });
  
    if (!cur_usr_hld_amnt)
      throw new HttpException(
        'User does not have any holding for this account',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
  
    if (body.amount > cur_usr_hld_amnt.amount) {
      throw new HttpException(
        'Not enough holdings of these shares',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  
    let amount_received = body.amount * share_owner.price;
    const final_amount = amount_received - (amount_received * 0.2) / 100;
  
    if (cur_usr_hld_amnt.investedInr - amount_received < 1)
      amount_received = cur_usr_hld_amnt.investedInr;
  
    const sell_amount = this.pService.holding.update({
      where: {
        buyer_id_seller_id: {
          seller_id: share_owner?.id,
          buyer_id: req.user.id,
        },
      },
      data: {
        amount: {
          decrement: body.amount,
        },
        investedInr: {
          decrement: amount_received,
        },
      },
    });
  
    const new_price =
      share_owner.price - (body.amount * share_owner.price) / share_owner.shares;
  
    const mut_price = this.pService.user.update({
      where: {
        id: share_owner.id,
      },
      data: {
        price: new_price,
      },
    });
  
    const txn = this.pService.transaction.create({
      data: {
        buyer_id: req.user.id,
        seller_id: userId,
        amount: body.amount * -1,
        newPrice: new_price,
        price: share_owner.price,
        type: 'SELL', // Add type property
      },
    });
  
    if (cur_usr_hld_amnt?.type === 'referral') {
      const referralWallet = await this.pService.referralWallet.findFirst({
        where: {
          id: userId,
        },
      });
  
      if (!referralWallet)
        throw new HttpException(
          'Referral wallet not found',
          HttpStatus.NOT_FOUND,
        );
  
      const referralIncrement = this.pService.referralWallet.update({
        where: {
          id: userId,
        },
        data: {
          balance: {
            increment: final_amount,
          },
        },
      });
  
      await this.pService.$transaction([
        sell_amount,
        mut_price,
        txn,
        referralIncrement,
      ]);
    } else {
      const walIncr = this.pService.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          balance: {
            increment: final_amount,
          },
        },
      });
  
      await this.pService.$transaction([sell_amount, mut_price, txn, walIncr]);
    }
  
    if (cur_usr_hld_amnt.amount === body.amount) {
      await this.pService.holding.delete({
        where: {
          buyer_id_seller_id: {
            seller_id: share_owner?.id,
            buyer_id: req.user.id,
          },
        },
      });
    }
  }
  
  
  
}
