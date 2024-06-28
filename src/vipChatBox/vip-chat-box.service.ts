// vip-chat-box.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
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

  async getRoomsDataByUserID(userId: string) {
    // Fetch chat rooms where the user is either userOne or userTwo
    const chatRooms = await this.prisma.vipChatRoom.findMany({
      where: {
        OR: [
          { userOne: userId },
          { userTwo: userId },
        ],
      },
    });

    // Fetch user data for each userOne and userTwo
    const userDataPromises = chatRooms.map(async room => {
      const userOneDataPromise = this.prisma.user.findUnique({
        where: { id: room.userOne },
        select: { id: true, avatarPath: true, username: true },
      });
      const userTwoDataPromise = this.prisma.user.findUnique({
        where: { id: room.userTwo },
        select: { id: true, avatarPath: true, username: true },
      });
      const [userOneData, userTwoData] = await Promise.all([userOneDataPromise, userTwoDataPromise]);
      return {
        id: room.id,
        userOne: userOneData,
        userTwo: userTwoData,
        unread: room.unread,
        status: room.status,
        createdAt: room.createdAt,
      };
    });

    // Wait for all user data promises to resolve
    const roomsWithUserData = await Promise.all(userDataPromises);

    return roomsWithUserData;
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



  // async updateTimer(roomId: string, timerValue: string) {
  //   try {
  //     const updatedRoom = await this.prisma.vipChatRoom.update({
  //       where: { id: roomId },
  //       data: { timer: timerValue },
  //     });

  //     // Notify clients about the timer update
  //     this.sendRealTimeUpdate(roomId);
  //     return updatedRoom;
  //   } catch (error) {
  //     console.error('Error updating timer:', error);
  //     throw error;
  //   }
  // }

  async getVipChatRoomByRoomId(roomId: string) {
    try {
      const room = await this.prisma.vipChatRoom.findUnique({
        where: { id: roomId },
      });
      return room;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  }



  
}
