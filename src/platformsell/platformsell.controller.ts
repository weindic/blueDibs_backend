import { Controller, Post, Body, Patch, Req, Param } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { PlatformSellDTO, PlatformSellUpdateDTO } from './platformsell.dto';
import { EmailService } from 'src/email/email.service';

@Controller('platform-sell')
export class PlatformSellController {
  constructor(private readonly pService: PrismaService, 
    private readonly emailService: EmailService
  ) {}

  @Post()
  async addPlatformSellRequest(@Body() body: PlatformSellDTO, @Req() req) {
    const dtPltQ =  this.pService.platformSellRequest.create({
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


    const USERdATA = await this.pService.user.findUnique({
      where: { id:req.user.id },
    });




    let date = new Date();

        
    const notifData = {
      subject:"Sell Request Received From BlueDibs App. | "+date  ,
      body:"<h4> User requested to sell "+ body.percentage+" from his sahre: <b>"+USERdATA?.email+"</b> </h4> <p><b>Username : </b> "+USERdATA?.username+"</p> <p>Visit Dashboard : <a href='https://dashboard.bluedibs.com' target='_blank'>BlueDibs Dashboard</a></p>",
      
    }

  await this.emailService.sendNotifEmail(notifData);


  return dtPltQ;

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
