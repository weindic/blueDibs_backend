// src/vip-chat-request/vip-chat-request.controller.ts

import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { VipChatRequestService } from './vip-chat-request.service';
import { CreateVipChatRequestDto, UpdateStatusDto, UpdateSeenStatusDto, GetByFromIdDto, GetByToIdDto, GetByIdDto, GetVipChatRequestDto } from './vip-chat-request.dto';

@Controller('vip-chat-request')
export class VipChatRequestController {
  constructor(private readonly vipChatRequestService: VipChatRequestService) {}

  @Post('send')
  async sendNewRequest(@Body() createVipChatRequestDto: CreateVipChatRequestDto) {
    return this.vipChatRequestService.sendNewRequest(createVipChatRequestDto);
  }

  @Get('from/:fromId')
  async getDataByFromId(@Param() params: GetByFromIdDto) {
    return this.vipChatRequestService.getDataByFromId(params);
  }

  @Get('to/:toId')
  async getDataByToId(@Param() params: GetByToIdDto) {
    return this.vipChatRequestService.getDataByToId(params);
  }

  @Put('update-status')
  async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    return this.vipChatRequestService.updateStatus(updateStatusDto);
  }

  @Put('update-seen-status')
  async updateSeenStatus(@Body() updateSeenStatusDto: UpdateSeenStatusDto) {
    return this.vipChatRequestService.updateSeenStatus(updateSeenStatusDto);
  }


  @Get(':id')
  async getDataById(@Param() params: GetByIdDto) {
    return this.vipChatRequestService.getDataById(params);
  }

  @Post('get-latest')
  async getLatestVipChatRequest(@Body() getVipChatRequestDto: GetVipChatRequestDto) {
    return await this.vipChatRequestService.getLatestVipChatRequest(getVipChatRequestDto);
  }
}
