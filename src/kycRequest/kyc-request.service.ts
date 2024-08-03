import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { CreateKycRequestDto } from './create-kyc-request.dto';
import { UpdateKycStatusDto } from './update-kyc-status.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class KycRequestService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async create(createKycRequestDto: CreateKycRequestDto) {


    const userdt = await this.prisma.user.findUnique({
      where: { id:createKycRequestDto.userId },
    });



          
    let date = new Date();
        
    const notifData = {
      subject:"New KYC request received kindly checkout. | "+date  ,
      body:"<h4>User requested for KYC : <b>"+userdt?.email+"</b> </h4> <p><b>Username : </b> "+userdt?.username+"</p> <p>Status: <b>PENDING</b></p>  <p>Visit Dashboard : <a href='https://dashboard.bluedibs.com' target='_blank'>BlueDibs Dashboard</a></p>",
      
    }


  await this.emailService.sendNotifEmail(notifData);

  
    return this.prisma.kycRequest.upsert({
      where: {
        userId: createKycRequestDto.userId,
      },
      update: {
        ...createKycRequestDto,
      },
      create: {
        ...createKycRequestDto,
      },
    });


    


  }
  

  async updateStatus(id: string, updateKycStatusDto: UpdateKycStatusDto) {
    const kycRequest = await this.prisma.kycRequest.findUnique({ where: { id } });
    if (!kycRequest) {
      throw new NotFoundException('KYC Request not found');
    }

    return this.prisma.kycRequest.update({
      where: { id },
      data: { status: updateKycStatusDto.status },
    });
  }

  async findByUserId(userId: string) {
    const data = await this.prisma.kycRequest.findUnique({
      where: { userId },
    });
  
    if (data) {
      return { data, status: true };
    } else {
      return { data: null, status: false };
    }
  }
  
}
