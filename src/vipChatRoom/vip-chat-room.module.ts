import { Module } from '@nestjs/common';
import { VipChatRoomService } from './vip-chat-room.service';
import { VipChatRoomController } from './vip-chat-room.controller';
import { PrismaService } from 'src/Prisma.Service';

@Module({
  controllers: [VipChatRoomController],
  providers: [VipChatRoomService, PrismaService],
})
export class VipChatRoomModule {}
