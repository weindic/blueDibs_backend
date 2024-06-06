import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PopularProfileService } from './popular-profile.service';
import { AssignBlueTickDTO } from './popular-profile.dto';

@Controller('popular-profile')
export class PopularProfileController {
  constructor(private readonly popularProfileService: PopularProfileService) {}

  @Post('assignBlueTick')
  async assignBlueTick(@Body() assignBlueTickDTO: AssignBlueTickDTO) {
    return this.popularProfileService.assignBlueTick(assignBlueTickDTO);
  }

  @Get('status/:userId')
  async getBlueTickStatusByUserId(@Param('userId') userId: string) {
    return this.popularProfileService.getBlueTickStatusByUserId(userId);
  }
}
