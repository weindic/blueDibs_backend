import { Module } from '@nestjs/common';
import { VipChatBoxService } from './vip-chat-box.service';
import { VipChatBoxController } from './vip-chat-box.controller';
import { PrismaService } from '../Prisma.service';
import { VIPChatGateway } from './vip-chat.gateway';

@Module({
  controllers: [VipChatBoxController],
  providers: [VipChatBoxService, PrismaService, VIPChatGateway],
})
export class VipChatBoxModule {}
