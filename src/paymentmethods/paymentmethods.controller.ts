import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { UpdatePaymentmethodDto } from './paymentmethods.dto';

@Controller('paymentmethods')
export class PaymentmethodsController {
  constructor(private readonly pService: PrismaService) {}

  @Get('getPaymentData/:userId')
  findOne(@Req() req) {
    return this.pService.paymentMethod.findFirst({
      where: {
        User: {
          id: req.userId,
        },
      },
    });
  }

  @Post()
  async update(
    @Body() updatePaymentmethodDto: UpdatePaymentmethodDto,
    @Req() req,
  ) {
    // REFACTOR: make this user extraction to middleware level

    console.log(req);

    // or add a claim to the token holding user id
    const user = await this.pService.user.findFirst({
      where: {
        id: req.body.id,
      },
    });

    if (!user) throw new UnauthorizedException('user not found');

    return this.pService.paymentMethod.upsert({
      where: {
        userId: user.id,
      },
      update: {
        upiId: updatePaymentmethodDto.upiId,
      },
      create: {
        upiId: updatePaymentmethodDto.upiId,
        userId: user.id,
      },
    });
  }
}
