import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVipChatRoomDto, UpdateUnreadStatusDto } from './create-vip-chat-room.dto';


@Injectable()
export class VipChatRoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(createVipChatRoomDto: CreateVipChatRoomDto) {
    const { userOne, userTwo } = createVipChatRoomDto;
    let chatRoom = await this.prisma.vipChatRoom.findFirst({
      where: {
        OR: [
          { userOne, userTwo },
          { userOne: userTwo, userTwo: userOne },
        ],
      },
    });

    if (chatRoom) {
      return chatRoom;
    }

    chatRoom = await this.prisma.vipChatRoom.create({
      data: {
        userOne,
        userTwo,
      },
    });

    return chatRoom;
  }

  async getChatRoomsByUserOne(userOne: string) {
    return this.prisma.vipChatRoom.findMany({
      where: { userOne },
    });
  }

  async getChatRoomsByUserTwo(userTwo: string) {
    return this.prisma.vipChatRoom.findMany({
      where: { userTwo },
    });
  }

  async updateUnreadStatus(updateUnreadStatusDto: UpdateUnreadStatusDto) {
    const { id } = updateUnreadStatusDto;
    return this.prisma.vipChatRoom.update({
      where: { id },
      data: { unread: 0 },
    });
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




  async getDataByRoomId(roomId: string) {
    // Fetch data for the chat room with the given ID
    const room = await this.prisma.vipChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error('Chat room not found');
    }

    // Fetch user data for userOne and userTwo
    const userOneDataPromise = this.prisma.user.findUnique({
      where: { id: room.userOne },
      select: { id: true, avatarPath: true, username: true },
    });
    const userTwoDataPromise = this.prisma.user.findUnique({
      where: { id: room.userTwo },
      select: { id: true, avatarPath: true, username: true },
    });
    const [userOneData, userTwoData] = await Promise.all([userOneDataPromise, userTwoDataPromise]);

    // Return room data with user data
    return {
      id: room.id,
      userOne: userOneData,
      userTwo: userTwoData,
      unread: room.unread,
      status: room.status,
      createdAt: room.createdAt,
    };
  }


  

}
