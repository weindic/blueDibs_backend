import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { VipChatBoxService } from './vip-chat-box.service';
import { CreateVipChatBoxDto, UpdateSeenAllDto, DeleteMessageDto } from './vip-chat-box.dto';

@Controller('vip-chat-box')
export class VipChatBoxController {
  constructor(private readonly vipChatBoxService: VipChatBoxService) {}

  @Post('sendMessage')
  sendMessage(@Body() createVipChatBoxDto: CreateVipChatBoxDto) {
    return this.vipChatBoxService.sendMessage(createVipChatBoxDto);
  }

  @Patch('deleteMessage')
  deleteMessage(@Body() deleteMessageDto: DeleteMessageDto) {
    return this.vipChatBoxService.deleteMessage(deleteMessageDto);
  }

  @Patch('updateSeenAll')
  updateSeenAll(@Body() updateSeenAllDto: UpdateSeenAllDto) {
    return this.vipChatBoxService.updateSeenAll(updateSeenAllDto);
  }

  @Get('chat-rooms/:userId')
  async getChatRoomsByUserId(@Param('userId') userId: string) {
    return this.vipChatBoxService.getRoomsDataByUserID(userId);
  }

  @Get('getAllMessages/:roomId')
  async getAllMessages(@Param('roomId') roomId: string) {
    return this.vipChatBoxService.getAllMessages(roomId);
  }

  @Patch('clearChat/:roomId')
  clearChat(@Param('roomId') roomId: string) {
    return this.vipChatBoxService.clearChat(roomId);
  }


  
  // @Post('update-timer/:roomId')
  // async updateTimer(@Param('roomId') roomId: string, @Body('timerValue') timerValue: string) {
  //   return this.vipChatBoxService.updateTimer(roomId, timerValue);
  // }

  @Get('room/:roomId')
  async getVipChatRoomByRoomId(@Param('roomId') roomId: string) {
    return this.vipChatBoxService.getVipChatRoomByRoomId(roomId);
  }


  // @Get('getLastMessageBy/:roomId')
  // getLastMessageByRoomId(@Param('roomId') roomId: string) {
  //   return this.vipChatBoxService.getLastMessageByRoomId(roomId);
  // }
}
