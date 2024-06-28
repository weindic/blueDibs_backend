import { Controller, Post, Body, Get, Param, Patch, NotFoundException } from '@nestjs/common';
import { VipChatRoomService } from './vip-chat-room.service';
import { CreateVipChatRoomDto, EndChatDto, StartChatRoomDto, UpdateUnreadStatusDto } from './create-vip-chat-room.dto';


@Controller('vip-chat-room')
export class VipChatRoomController {
  constructor(private readonly vipChatRoomService: VipChatRoomService) {}

  @Post('startChatRoom')
  startChatRoom(@Body() StartChatRoomDto: StartChatRoomDto) {
    return this.vipChatRoomService.startChatRoom(StartChatRoomDto);
  }


  @Post('createRoom')
  createRoom(@Body() createVipChatRoomDto: CreateVipChatRoomDto) {
    return this.vipChatRoomService.createRoom(createVipChatRoomDto);
  }

  @Get('getChatRooms/userOne/:userOne')
  getChatRoomsByUserOne(@Param('userOne') userOne: string) {
    return this.vipChatRoomService.getChatRoomsByUserOne(userOne);
  }

  @Get('getChatRooms/userTwo/:userTwo')
  getChatRoomsByUserTwo(@Param('userTwo') userTwo: string) {
    return this.vipChatRoomService.getChatRoomsByUserTwo(userTwo);
  }

  @Post('updateUnreadStatus')
  updateUnreadStatus(@Body() updateUnreadStatusDto: UpdateUnreadStatusDto) {
    return this.vipChatRoomService.updateUnreadStatus(updateUnreadStatusDto);
  }


 
  // Define the endpoint for getting rooms data by userID
  @Get('getRoomsDataBy/userID/:userID')
  getRoomsDataByUserID(@Param('userID') userID: string) {
    return this.vipChatRoomService.getRoomsDataByUserID(userID);
  }


  @Get(':roomId')
  async getDataByRoomId(@Param('roomId') roomId: string) {
    try {
      const roomData = await this.vipChatRoomService.getDataByRoomId(roomId);
      return roomData;
    } catch (error) {
      throw new NotFoundException('Chat room not found');
    }
  }


  @Post('end-chat')
  async endTheChat(@Body() endChatDto: EndChatDto) {
    return this.vipChatRoomService.endTheChat(endChatDto);
  }
}
