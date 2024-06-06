// vip-chat-box.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma.service';
import { CreateVipChatBoxDto, UpdateSeenAllDto, DeleteMessageDto } from './vip-chat-box.dto';
import { VIPChatGateway } from './vip-chat.gateway';

@Injectable()
export class VipChatBoxService {
  constructor(
    private prisma: PrismaService,
    private vipChatGateway: VIPChatGateway,
  ) {}

  async sendMessage(createVipChatBoxDto: CreateVipChatBoxDto) {
    try {
      const message = await this.prisma.vipChatBox.create({
        data: {
          ...createVipChatBoxDto,
          type: createVipChatBoxDto.type || 'text',
          replyId: createVipChatBoxDto.replyId || '',
          file: createVipChatBoxDto.file || '',
        },
      });

      this.sendRealTimeMessage(createVipChatBoxDto.roomId, message);

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    const { id } = deleteMessageDto;
    await this.prisma.vipChatBox.update({
      where: { id },
      data: { status: 0 },
    });

    // Notify clients about the deleted message
    this.sendRealTimeUpdate(deleteMessageDto.roomId);
  }

  async updateSeenAll(updateSeenAllDto: UpdateSeenAllDto) {
    const { roomId } = updateSeenAllDto;
    await this.prisma.vipChatBox.updateMany({
      where: { roomId },
      data: { seenStatus: 0 },
    });

    // Notify clients about the update
    this.sendRealTimeUpdate(roomId);
  }

  async getAllMessages(roomId: string) {
    return this.prisma.vipChatBox.findMany({
      where: { roomId, status: 1 },
    });
  }

  async clearChat(roomId: string) {
    await this.prisma.vipChatBox.updateMany({
      where: { roomId },
      data: { status: 0 },
    });

    // Notify clients about the cleared chat
    this.sendRealTimeUpdate(roomId);
  }

  private sendRealTimeMessage(roomId: string, message: any) {
    this.vipChatGateway.sendMessageToClient(roomId, message);
  }

  private sendRealTimeUpdate(roomId: string) {
    this.vipChatGateway.sendUpdateToClient(roomId);
  }
}
