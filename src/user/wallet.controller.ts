import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ValidatePlatformEquitySell } from './user.DTOs';
import { PrismaService } from 'src/Prisma.Service';
import { UserService } from './UserService';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly pService: PrismaService,
    private readonly uService: UserService,
  ) {}

  @Post('validate-platform-sell')
  async validatePlatformEquitySell(
    @Req() req,
    @Body() body: ValidatePlatformEquitySell,
  ) {
    const user = await this.pService.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    if (!user)
      throw new HttpException('user doesnt exsist', HttpStatus.NOT_FOUND);

    return this.uService.processSellOwnEquity(body.percentage, user);
  }

  @Get('platform-sell-vars')
  async getPlatformSellVars(@Req() req) {
    const user = await this.pService.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    if (!user)
      throw new HttpException('user doesnt exsist', HttpStatus.NOT_FOUND);
    return this.uService.getSelfOwnEquiryVars(user);
  }
}
