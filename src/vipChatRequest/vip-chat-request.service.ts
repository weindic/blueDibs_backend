// src/vip-chat-request/vip-chat-request.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { CreateVipChatRequestDto, UpdateStatusDto, UpdateSeenStatusDto, GetByFromIdDto, GetByToIdDto, GetByIdDto, GetVipChatRequestDto } from './vip-chat-request.dto';
import { NotificationAlertsService } from '../notificationAlert/notification-alerts.service'; // Import NotificationAlertsService

@Injectable()
export class VipChatRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationAlertsService, // Inject NotificationAlertsService
  ) {}

  async sendNewRequest(data: CreateVipChatRequestDto) {
    // Check if a record with the same fromId and toId already exists
    const existingRequest = await this.prisma.vipChatRequest.findFirst({
        where: {
            fromId: data.fromId,
            toId: data.toId,
        },
        orderBy: {
            createdAt: 'desc', // Assuming there's a createdAt field to get the most recent record
        },
    });

    let request;

    if (existingRequest) {
        // Update the status of the existing request
        request = await this.prisma.vipChatRequest.update({
            where: { id: existingRequest.id },
            data,
        });
    } else {
        // Create a new vipChatRequest
        request = await this.prisma.vipChatRequest.create({
            data,
        });
    }

    // Create a notification
    await this.notificationService.createNotificationAlert({
        userId: data.toId, // toId from VipChatRequest will be userId in NotificationAlerts
        sourceId: request.id, // ID of the VipChatRequest
        fromId: data.fromId,
        type: 'vipchat',
        message: 'Requested to join your VIP chat.',
        seenStatus: '0',
        status: 1,
    });

    return request;
}

  

  async getDataByFromId({ fromId }: GetByFromIdDto) {
    return this.prisma.vipChatRequest.findMany({
      where: { fromId },
    });
  }

  async getDataByToId({ toId }: GetByToIdDto) {
    return this.prisma.vipChatRequest.findMany({
      where: { toId },
    });
  }

 

  async updateStatus({ id, status }: UpdateStatusDto) {
    const request = await this.prisma.vipChatRequest.findUnique({
        where: { id },
    });

    if (!request) {
        throw new NotFoundException('Request not found');
    }

    let message = '';
    switch (status) {
        case 2:
            message = 'Has accepted your VIP chat request.';
            break;
        case 3:
            message = 'Has rejected your VIP chat request.';
            break;
        default:
            // For other status, do nothing with notification
            break;
    }

    // Update the status of related notifications
 
        await this.notificationService.updateNotificationStatusBySourceId({
            sourceId: id,
            userId: request.toId,
            status: 0,
        });
    

    // Update the status of the VIP chat request
    const updatedRequest = await this.prisma.vipChatRequest.update({
        where: { id },
        data: { status },
    });

    // If status requires a notification, create it
    if (message) {
        await this.notificationService.createNotificationAlert({
            userId: request.fromId,
            sourceId: id,
            fromId: request.toId,
            type: 'vipchat',
            message,
            seenStatus: '0',
            status: 1,
        });
    }

    return updatedRequest;
}





  async updateSeenStatus({ id, seenStatus }: UpdateSeenStatusDto) {
    const request = await this.prisma.vipChatRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return this.prisma.vipChatRequest.update({
      where: { id },
      data: { seenStatus },
    });
  }



  async getDataById({ id }: GetByIdDto) {
    const request = await this.prisma.vipChatRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }




  async getLatestVipChatRequest(data: GetVipChatRequestDto) {
    const latestRequest = await this.prisma.vipChatRequest.findFirst({
      where: {
        fromId: data.fromId,
        toId: data.toId,
        status: 2,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return latestRequest;
  }

}
