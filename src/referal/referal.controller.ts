import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import { ReferralService } from './referal.service';
import { ReferralWalletService } from '../refralWallet/referral-wallet.service';
import { CreateReferralDTO, UpdateReferralDTO } from './refral.dto';
import { CreateReferralWalletDTO } from '../refralWallet/referral-wallet.dto';
import { UserService } from '../user/UserService'; // Import UserService to fetch user ID

@Controller('referrals')
export class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly referralWalletService: ReferralWalletService,
    private readonly userService: UserService // Add UserService to the constructor
  ) {}

  @Post()
  async create(@Body() createReferralDto: CreateReferralDTO) {
    return this.referralService.createReferral(createReferralDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReferralDto: UpdateReferralDTO) {
    return this.referralService.updateReferral(id, updateReferralDto);
  }

  @Post('verify')
  async verifyReferralCode(@Body() verifyPayload: { receiverId: string; referralCode: string }) {
    const { receiverId, referralCode } = verifyPayload;
    
    // Find the receiver's ID from Firebase ID
    const receiver = await this.userService.findUserByFirebaseId(receiverId);
    if (!receiver) {
      throw new Error('Receiver not found.');
    }
    const receiverObjectId = receiver.id;

    // Find the referral by referral code and status
    const referral = await this.referralService.findReferralByCodeAndStatus(referralCode, 1);
    if (!referral) {
      return { status: 201, message: 'Already claimed code'};
   
    }

    const senderId = referral.senderId;

    // Update the status of the referral to zero and save receiverId
    await this.referralService.updateReferral(referral.id, { status: 0, receiverId: receiverObjectId });

    // Update sender's wallet balance
    await this.updateOrCreateWalletBalance(senderId, 50);

    // Update receiver's wallet balance
    await this.updateOrCreateWalletBalance(receiverObjectId, 250);

    return { status: 200, message: 'Referral code verified and balances updated successfully.', senderId: senderId };
  }

  async updateOrCreateWalletBalance(userId: string, amount: number) {
    const existingWallet = await this.referralWalletService.getWalletBalance(userId);

    if (existingWallet !== 0) {
      // Update the existing wallet balance
      await this.referralWalletService.updateBalance(userId, amount);
    } else {
      // Create a new wallet entry
      await this.referralWalletService.createReferralWallet({
        userId,
        balance: amount,
        status: 1,
        createdAt: new Date(),
      });
    }
  }



  
  @Post('count')
  async getReferralCounts(@Body() payload: { userId: string }) {
    const { userId } = payload;
    
    const generatedCount = await this.referralService.countReferrals(userId);
    const claimedCount = await this.referralService.countClaimedReferrals(userId);

    return {
      generatedCount,
      claimedCount,
      totalGeneratedAmount: generatedCount * 50, // Assuming 50 is the amount per referral generated
      totalClaimedAmount: claimedCount * 250,   // Assuming 250 is the amount per referral claimed
    };
  }
}
