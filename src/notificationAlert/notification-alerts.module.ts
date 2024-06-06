// src/notification-alerts/notification-alerts.module.ts

import { Module } from '@nestjs/common';
import { NotificationAlertsService } from './notification-alerts.service';
import { NotificationAlertsController } from './notification-alerts.controller';
import { PrismaService } from '../Prisma.Service';

import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [],
  controllers: [NotificationAlertsController],
  providers: [NotificationGateway, NotificationAlertsService, PrismaService],
})
export class NotificationAlertsModule {}
