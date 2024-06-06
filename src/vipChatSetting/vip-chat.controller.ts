import { Body, Controller, Param, Post, Get, HttpCode } from '@nestjs/common';
import { VIPChatService } from './vip-chat.service';
import { EnableVIPChatDto, DisableVIPChatDto, CheckUserVIPDto, GetVIPChatDataDto } from './vip-chat.dto';

@Controller('vip-chat')
export class VIPChatController {
  constructor(private readonly vipChatService: VIPChatService) {}

  @Post('enable')
  @HttpCode(200)
  async enableVIPChat(@Body() enableVIPChatDto: EnableVIPChatDto) {
    return this.vipChatService.enableVIPChat(enableVIPChatDto);
  }

  @Post('disable')
  @HttpCode(200)
  async disableVIPChat(@Body() disableVIPChatDto: DisableVIPChatDto) {
    return this.vipChatService.disableVIPChat(disableVIPChatDto);
  }

  @Post('check')
  async checkUserVIP(@Body() checkUserVIPDto: CheckUserVIPDto) {
    return this.vipChatService.checkUserVIP(checkUserVIPDto);
  }

  @Get(':userId')
  async getVIPChatData(@Param('userId') userId: string) {
    return this.vipChatService.getVIPChatData({ userId });
  }
}
