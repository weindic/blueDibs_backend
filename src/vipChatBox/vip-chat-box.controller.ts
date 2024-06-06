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

  @Get('getAllMessages/:roomId')
  getAllMessages(@Param('roomId') roomId: string) {
    return this.vipChatBoxService.getAllMessages(roomId);
  }

  @Patch('clearChat/:roomId')
  clearChat(@Param('roomId') roomId: string) {
    return this.vipChatBoxService.clearChat(roomId);
  }

  // @Get('getLastMessageBy/:roomId')
  // getLastMessageByRoomId(@Param('roomId') roomId: string) {
  //   return this.vipChatBoxService.getLastMessageByRoomId(roomId);
  // }
}
