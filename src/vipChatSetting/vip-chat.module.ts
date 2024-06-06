import { Module } from '@nestjs/common';
import { VIPChatService } from './vip-chat.service';
import { VIPChatController } from './vip-chat.controller';
import { PrismaService } from 'src/Prisma.Service';

@Module({
  controllers: [VIPChatController],
  providers: [VIPChatService, PrismaService],
})
export class VIPChatModule {}
