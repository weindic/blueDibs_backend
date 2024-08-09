import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/Prisma.Service';
import { EmailService } from 'src/email/email.service';
import {
  AddFundDTO,
  UpdateFundDTO,
  UpdateUserDTO,
  UpdateUserPersonalInfoDTO,
} from './user.DTOs';
import bigDecimal from 'js-big-decimal';
import { ObjectId } from 'bson';

@Injectable()
export class UserService {
  constructor(
    private readonly pService: PrismaService,
    private readonly emailServ: EmailService,
  ) {}

  async getTotalInvestmentOnUser(
    userId: string,
  ): Promise<{ ttlInvestment: number; currentInvestmentValue: number }> {
    let ttlInvestment = 0;
    let currInvestmentValue = 0;
    const holdings = await this.pService.holding.findMany({
      where: {
        seller_id: userId,
      },
    });

    const user = await this.pService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('user with this id not found');

    for (const holding of holdings) {
      ttlInvestment += holding.investedInr;
      currInvestmentValue += holding.amount * user?.price;
    }

    if (ttlInvestment < 1) ttlInvestment = 0;
    return { ttlInvestment, currentInvestmentValue: currInvestmentValue };
  }

  generateGraphData(txns: Transaction[]) {
    const graphData: { date: Date; price: number }[] = [];

    graphData.push({
      date: dayjs().toDate(),
      price: 1, // means the has fresh account,
    });

    for (const txn of txns) {
      graphData.push({
        date: dayjs(txn.created).toDate(),
        price: txn.newPrice,
      });
    }

    return graphData;
  }

  async getSelfOwnEquiryVars(user: User) {
    return this.getTotalInvestmentOnUser(user.id);
  }

  async sendOTpEmail(email, passedOtp?: string) {
    const generatedOtp = this.generateOTP(4);
    let otp = passedOtp;
    if (!otp) otp = generatedOtp;

    await this.pService.user.update({
      where: {
        email,
      },
      data: {
        otp: +otp,
        otpSentTime: new Date(),
      },
    });
    
    return this.emailServ.sendOtpEmail(email, otp);
  }

  // utils
  generateOTP(length) {
    const characters = '0123456789';
    const otp: string[] = [];

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp.push(characters[randomIndex]);
    }

    return otp.join('');
  }

  async processSellOwnEquity(percentage: number, user: User) {
    // example : percentage = 2.5%, user.platformEquity = 2.5%, user.userEquity = 10%
    // obtain percentage
    const sellPercentage = (percentage / user.userEquity) * 100;
    const platformEquity = user.platformEquity * (sellPercentage / 100);

    const investment_on_self = await this.getTotalInvestmentOnUser(user.id);

    // calculate balance to increament on user account
    const balance = investment_on_self.ttlInvestment * (percentage / 100);

    return {
      userEquity: user.userEquity - percentage,
      platformEquity: user.platformEquity - platformEquity,
      balance: user.balance + balance,
      ...investment_on_self,
    };
  }

  async sellPlatformEquity(userId: string, percentage: number) {
    const user = await this.pService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new HttpException('user doesnt exsist', HttpStatus.NOT_FOUND);

    // validate if user has sold 2.5% equity in last 24hours
    const lastSell = user.lastSell;
    if (
      !!lastSell.time &&
      !!lastSell.equity &&
      lastSell.equity + percentage >= 2.5 &&
      dayjs().diff(dayjs(lastSell.time), 'hours') < 24
    ) {
      throw new ForbiddenException('ERR_CANNOT_SELL_001');
    } else if (dayjs().diff(dayjs(lastSell.time), 'hours') < 24) {
      lastSell.equity = (lastSell.equity || 0) + percentage;
    } else {
      lastSell.equity = percentage;
    }
    // end validate
    lastSell.time = new Date();

    if (percentage > user.userEquity)
      throw new HttpException(
        'user doesnt have this much equity left',
        HttpStatus.FORBIDDEN,
      );

    const processed = await this.processSellOwnEquity(percentage, user);

    const shareAmountByPercentage = new bigDecimal(user.shares).multiply(
      new bigDecimal(percentage / 100),
    );

    const sharesValueDelta = shareAmountByPercentage.multiply(
      new bigDecimal(user.price),
    );

    let sharesValue = new bigDecimal(user.shares).multiply(
      new bigDecimal(user.price),
    );

    sharesValue = sharesValue.subtract(sharesValueDelta);

    const newPriceOfShare = sharesValue.divide(new bigDecimal(user.shares));

    // const self_tiiys_vars = await this.getSelfOwnEquiryVars(user);

    // const userShareInBigNum = new bigDecimal(
    //   self_tiiys_vars.currentInvestmentValue * (percentage / 100),
    // );

    // const priceDelta = userShareInBigNum.divide(
    //   new bigDecimal(user.shares),
    //   10,
    // );
    // const userPrice = new bigDecimal(user.price);

    // console.log(userPrice.subtract(priceDelta).getValue());

    // txns
    await this.pService.user.update({
      where: {
        id: userId,
      },
      data: {
        // atomic increment not woring
        userEquity: processed.userEquity,
        platformEquity: processed.platformEquity,
        balance: processed.balance,
        lastSell: lastSell,
        price: +newPriceOfShare.getValue(),
      },
    });
  }

  async getFollowerOrFollowings(
    username: string,
    { page, type }: { page: number; type: 'followers' | 'following' },
  ) {
    const perPage = 10;

    const user = await this.pService.user.findFirst({
      where: { username },
    });

    let total = 0;
    let data: any[] = [];

    if (type === 'followers') {
      total = await this.pService.user.count({
        where: {
          followingIDs: { has: user?.id },
        },
      });

      data = await this.pService.user.findMany({
        where: {
          followingIDs: { has: user?.id },
        },

        take: perPage,
        skip: page * perPage,
      });
    }

    if (type === 'following') {
      total = await this.pService.user.count({
        where: {
          followersIDs: { has: user?.id },
        },
      });

      data = await this.pService.user.findMany({
        where: {
          followersIDs: { has: user?.id },
        },
        take: perPage,
        skip: page * perPage,
      });
    }

    return {
      page,
      perPage,
      total,
      data,
    };
  }

  async addFundReq(userId: string, body: AddFundDTO) {
    // const lastReq = await this.pService.addFundRequest.findFirst({
    //   where: {
    //     userId,
    //   },
    // });
    // if(!!lastReq && dayjs().diff(dayjs(lastReq.created), 'hours') < 24){
    //   throw new ForbiddenException('cannot request to add fund multiple times within 24hours')
    // }


    const addFnd = this.pService.user.update({
      where: {
        id: userId,
      },
      data: {
        AddFundRequest: {
          create: {
            amount: body.amount,
            txnId: body.txnId,
            status: 'PENDING',
          },
        },
      },
    });


    const userdt = await this.pService.user.findUnique({
      where: { id:userId },
    });



          
    let date = new Date();
        
    const notifData = {
      subject:"User added fund to his wallet. | "+date  ,
      body:"<h4>Kindly verify the payment and user add-fund request of : <b>"+body.amount+"</b> </h4> <p><b>Transaction Ref ID : </b> "+body.txnId+"</p> <p><b>Username : </b> "+userdt?.username+"</p> <p>Status: <b>PENDING</b></p>  <p>Visit Dashboard : <a href='https://dashboard.bluedibs.com' target='_blank'>BlueDibs Dashboard</a></p>",
      
    }


  await this.emailServ.sendNotifEmail(notifData);

  return addFnd;

  }

  async updateFundReq(reqId: string, status: UpdateFundDTO) {
    const lastReq = await this.pService.addFundRequest.findFirst({
      where: {
        id: reqId,
      },
    });

    if (!lastReq || !lastReq.userId)
      throw new NotFoundException('reqId not found');

    let amount = 0;
    if (lastReq.status == 'ACCEPTED' && status.status == 'ACCEPTED') {
      throw new HttpException('balance added already', HttpStatus.NOT_MODIFIED);
    }

    if (status.status == 'ACCEPTED') {
      // increment the user amount
      amount += +lastReq.amount;
    } else if (status.status == 'REJECTED' && lastReq.status == 'ACCEPTED') {
      // reverse if previosuly increamented account
      amount -= +lastReq.amount;
    }

    // if last status will be ['REJECTED', 'PENDING'] then only amount will increease
    return this.pService.user.update({
      where: {
        id: lastReq.userId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  updateUserInfo(id: string, body: UpdateUserPersonalInfoDTO) {
    return this.pService.user.update({
      where: {
        id,
      },
      data: {
        pan: body.pan,
      },
    });
  }


// update profile while new signup=============//

async updateUserProfile(userId: string, body: UpdateUserDTO): Promise<any> {
  // Verify userId and handle invalid userId
  if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
  }

  // Convert date of birth from string to Date object
  let dobDate: Date | null = null;
  if (body.dob) {
      dobDate = new Date(body.dob);
  }

  // Create a dummy avatar path
  const dummyAvatarPath = 'path/to/dummy/avatar.jpg';


  // Prepare the updated user data object
  const updatedUserData = {
      dob: dobDate,
      mobile:body.mobile,
      gender: body.gender,
      bio: body.bio,
      avatarPath: body.avatar === false ? dummyAvatarPath : body.avatarPath,
      username:body.username
  };



  // Update the user profile in the database using Prisma
  const updatedUser = await this.pService.user.update({
      where: { id: userId },
      data: updatedUserData,
  });


  const result = {
    status:200,
    data:updatedUser,
    message:'profile updated successfully'
  }
  // Return the updated user data
  return result;
}




// You need to implement the `uploadAvatar` function based on your file storage setup.
// This function should handle the storage of the avatar file and return the file path.
// async uploadAvatar(avatar: Express.Multer.File): Promise<string> {

//   return 'path/to/uploaded/avatar.jpg'; // Replace with actual implementation
// }


async findUserByFirebaseId(firebaseId: string): Promise<User | null> {
  try {
    // Use the Firebase Admin SDK to verify the ID token and retrieve user information
    
    // Now, you can check if the user exists in your database based on the Firebase UID or any other criteria
    const user = await this.pService.user.findUnique({
      where: {
        firebaseId:firebaseId,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user by Firebase ID:', error);
    return null; // Return null if user not found or any error occurs
  }
}


}
