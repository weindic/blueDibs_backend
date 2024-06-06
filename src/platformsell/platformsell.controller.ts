import { Controller, Post, Body, Patch, Req, Param } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { PlatformSellDTO, PlatformSellUpdateDTO } from './platformsell.dto';

@Controller('platform-sell')
export class PlatformSellController {
  constructor(private readonly pService: PrismaService) {}

  @Post()
  addPlatformSellRequest(@Body() body: PlatformSellDTO, @Req() req) {
    return this.pService.platformSellRequest.create({
      data: {
        amount: body.percentage,
        status: 'PENDING',
        User: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
  }

  @Patch(':requestId')
  updatePLatformSellRequest(
    @Body() body: PlatformSellUpdateDTO,
    @Param('requestId') reqId,
  ) {
    return this.pService.platformSellRequest.update({
      data: {
        status: body.status,
      },
      where: {
        id: reqId,
      },
    });
  }
}
