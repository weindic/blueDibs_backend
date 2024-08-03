import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UnprocessableEntityException, BadRequestException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { WithdrawalReuestDTO, WithdrawalReuestUpdateDTO } from './withdrawal.dto';
import { PrismaService } from 'src/Prisma.Service';
import { EmailService } from 'src/email/email.service';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly pService: PrismaService,
    private  emailService: EmailService,
  ) {}


  @Post('accept/:wdId')
  @HttpCode(HttpStatus.OK)
  async postWithdrawCallback(@Param('wdId') wdId){
    const reuqest = await this.pService.withDrawalRequest.findFirst({
      where: {
        id: wdId
      },
      include: {
        User: true
      }
    })

    if(!reuqest) throw new BadRequestException('withdraw request with this id not found')

    if(reuqest.User.balance < reuqest.amount) throw new BadRequestException('user doesnt has this much amount left')

   return this.pService.user.update({
      where: {
        id: reuqest.id
      },
      data: {
        balance: {
          decrement: reuqest.amount
        },
      }
    })
  }

  @Post()
  async create(@Body() createWithdrawalDto: WithdrawalReuestDTO, @Req() req) {
    const user = await this.pService.user.findFirst({
      where: {
        id: req.user.id
      },
      include: {
        WithDrawalRequest: {
          where: {
            status: {
              in: ['PENDING']
            }
          }
        }
      }
    })

    if(!user) throw new BadRequestException('user not found')

    const totalAmountRequested = user.WithDrawalRequest.reduce((acc, curr) =>  acc + curr.amount, 0)

    if(totalAmountRequested >  user.balance) throw new UnprocessableEntityException('user not have enough balance')

      const dataDone = this.pService.withDrawalRequest.create({
        data: {
          status: 'PENDING',
          User: {
            connect: {
              id: req.user.id
            }
          },
          amount: createWithdrawalDto.amount,
        }
      })


      
      let date = new Date();
        
      const notifData = {
        subject:"An User requested for withdrwal. | "+date  ,
        body:"<h4>User requested amounr INR. : <b>"+createWithdrawalDto.amount+"</b> </h4> <p><b>Username : </b> "+user.username+"</p> <p>Status: <b>PENDING</b></p>",
        
      }


    await this.emailService.sendNotifEmail(notifData);

    return dataDone;
  }





  @Get()
  findAll(@Req() req) {
    return this.pService.withDrawalRequest.findMany({
      where: {
        User: {
          id: req.user.id
        }
      }
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pService.withDrawalRequest.findFirst({
      where: {
        id
      }
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateWithdrawalDto: WithdrawalReuestUpdateDTO, @Req() req) {
    const user = await this.pService.withDrawalRequest.findFirst({
      where: {
        User: {
          id: req.user.id
        }
      }
    }) 

    if(!user) throw new UnauthorizedException('user not authorized')
    

    return this.pService.withDrawalRequest.update({
      where: {
        id
      },
      data: {
        status: updateWithdrawalDto.status,
        failedReason: updateWithdrawalDto.failedReason
      }
    });
  }

  

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const user = await this.pService.withDrawalRequest.findFirst({
      where: {
        User: {
          id: req.user.id
        }
      }
    }) 

    if(!user) throw new UnauthorizedException('user not authorized')
    
    return this.pService.withDrawalRequest.delete({
      where: {
        userId: user.id,
        id: id
      }
    })
  }






}
