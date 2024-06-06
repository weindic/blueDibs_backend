import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { NotificationAlertsService } from './notification-alerts.service';
import { CreateNotificationAlertDto, UpdateStatusDto, UpdateSeenStatusDto, GetByUserIdDto, UpdateAllSeenStatusDto, UpdateUserIdDto } from './notification-alerts.dto';

@Controller('notification-alerts')
export class NotificationAlertsController {
  constructor(private readonly notificationAlertsService: NotificationAlertsService) {}

  @Post('create')
  async createNotificationAlert(@Body() createNotificationAlertDto: CreateNotificationAlertDto) {
    return this.notificationAlertsService.createNotificationAlert(createNotificationAlertDto);
  }

  @Get('realtime/user/:userId')
  async getRealTimeNotificationsByUserId(@Param('userId') userId: string) {
    return this.notificationAlertsService.getRealTimeNotificationsByUserId({ userId });
  }

  @Get('user/:userId')
  async getNotificationsByUserId(@Param() params: GetByUserIdDto) {
    return this.notificationAlertsService.getNotificationsByUserId(params);
  }

  @Put('update-status')
  async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    return this.notificationAlertsService.updateStatus(updateStatusDto);
  }

  @Put('update-seen-status')
  async updateSeenStatus(@Body() updateSeenStatusDto: UpdateSeenStatusDto) {
    return this.notificationAlertsService.updateSeenStatus(updateSeenStatusDto);
  }

  @Put('seen-status/all')
  updateAllSeenStatusByUserId(@Body() updateAllSeenStatusDto: UpdateAllSeenStatusDto) {
    return this.notificationAlertsService.updateAllSeenStatusByUserId(updateAllSeenStatusDto);
  }


  @Post('update-user-id')
  async updateUserId(@Body() updateUserIdDto: UpdateUserIdDto) {
    return this.notificationAlertsService.updateUserId(updateUserIdDto);
  }
}
