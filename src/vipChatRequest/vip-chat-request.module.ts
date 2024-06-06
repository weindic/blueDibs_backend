// src/vip-chat-request/vip-chat-request.module.ts

import { Module } from '@nestjs/common';
import { VipChatRequestService } from './vip-chat-request.service';
import { VipChatRequestController } from './vip-chat-request.controller';
import { PrismaService } from 'src/Prisma.Service';
import { NotificationAlertsModule } from '../notificationAlert/notification-alerts.module'; // Ensure correct path
import { NotificationAlertsService } from 'src/notificationAlert/notification-alerts.service';
import { NotificationGateway } from 'src/notificationAlert/notification.gateway';

@Module({
  imports: [NotificationAlertsModule], // Ensure NotificationAlertsModule is imported
  controllers: [VipChatRequestController],
  providers: [VipChatRequestService, PrismaService, NotificationAlertsService, NotificationGateway],
})
export class VipChatRequestModule {}
