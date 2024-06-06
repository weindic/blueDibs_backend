import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma.Service';
import { CreateNotificationAlertDto, UpdateStatusDto, UpdateSeenStatusDto, GetByUserIdDto, UpdateUserIdDto } from './notification-alerts.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async  createNotificationAlert(data: CreateNotificationAlertDto) {
    try {
        // Create the notification alert using the provided data
        const notification = await this.prisma.notificationAlerts.create({
            data,
        });

        // Check if the userId is provided in the data
        if (data.userId) {
            // Try to find a user with the matching firebaseId
            const user = await  this.prisma.user.findFirst({
                where: {
                    firebaseId: data.userId,
                },
            });

            // If a matching user is found, update the notification with the user's _id
            if (user) {
                await  this.prisma.notificationAlerts.update({
                    where: { id: notification.id },
                    data: {
                        userId: user.id, // Assuming _id is the field name in the User collection
                    },
                });
            } else {
                // If no matching user is found, log a message
                console.log(`No user found with firebaseId ${data.userId}`);
            }
        }
        
        // Send real-time notification to client
        const notificationWithUser = await this.getNotificationWithUserDetails(notification);
        this.sendRealTimeNotification(data.userId, notificationWithUser);

        return notification; // Return the created notification alert
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error creating notification alert:', error);
        throw error;
    }

  }

  async getNotificationsByUserId({ userId }: GetByUserIdDto) {
    const notifications = await this.prisma.notificationAlerts.findMany({
      where: { userId },
    });

    const notificationsWithUsernames = await Promise.all(
      notifications.map(async (notification) => this.getNotificationWithUserDetails(notification)),
    );

    return notificationsWithUsernames;
  }

  async getRealTimeNotificationsByUserId({ userId }: GetByUserIdDto) {
    return this.getNotificationsByUserId({ userId });
  }

  async updateStatus({ id, status }: UpdateStatusDto) {
    const alert = await this.prisma.notificationAlerts.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Notification alert not found');
    }

    return this.prisma.notificationAlerts.update({
      where: { id },
      data: { status },
    });
  }

  async updateSeenStatus({ id, seenStatus }: UpdateSeenStatusDto) {
    const alert = await this.prisma.notificationAlerts.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Notification alert not found');
    }

    return this.prisma.notificationAlerts.update({
      where: { id },
      data: { seenStatus },
    });
  }

  async updateNotificationStatusBySourceId({ sourceId, status, userId }: { sourceId: string; status: number, userId: string }) {
    const notifications = await this.prisma.notificationAlerts.findMany({
      where: { sourceId: sourceId.toString(), userId },
    });

    if (!notifications || notifications.length === 0) {
      throw new NotFoundException('Notifications not found');
    }

    await this.prisma.notificationAlerts.updateMany({
      where: { sourceId: sourceId.toString() },
      data: { status },
    });

    // Send real-time update
    this.sendRealTimeUpdate(userId);
  }

  async updateAllSeenStatusByUserId({ userId, seenStatus }) {
    const notifications = await this.prisma.notificationAlerts.findMany({
      where: { userId },
    });

    if (!notifications || notifications.length === 0) {
      throw new NotFoundException('No notifications found for the user');
    }

    await this.prisma.notificationAlerts.updateMany({
      where: { userId },
      data: { seenStatus },
    });

    // Send real-time update
    this.sendRealTimeUpdate(userId);
  }

  private async getNotificationWithUserDetails(notification: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: notification.fromId },
    });
    return {
      ...notification,
      username: user?.username,
      avatarPath: user?.avatarPath,
    };
  }

  private sendRealTimeNotification(userId: string, notification: any) {
    this.notificationGateway.sendNotificationsToClient(userId, [notification]);
  }

  private sendRealTimeUpdate(userId: string) {
    this.notificationGateway.sendUpdateToClient(userId);
  }


  async updateUserId(updateUserIdDto: UpdateUserIdDto) {
    const { oldId, newId } = updateUserIdDto;

    // Update userId in the notification alerts
    await this.prisma.notificationAlerts.updateMany({
      where: { userId: oldId },
      data: { userId: newId },
    });

    return { message: 'User ID updated successfully' };
  }
}
