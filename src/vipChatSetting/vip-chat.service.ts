import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { EnableVIPChatDto, DisableVIPChatDto, CheckUserVIPDto, GetVIPChatDataDto } from './vip-chat.dto';

@Injectable()
export class VIPChatService {
  constructor(private prisma: PrismaService) {}

  async enableVIPChat(data: EnableVIPChatDto) {
    const { userId, audio, video, text } = data;
    const existingProfile = await this.prisma.vIPChatProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.prisma.vIPChatProfile.update({
        where: { userId },
        data: { audio, video, text, status: 1 },
      });
    } else {
      return this.prisma.vIPChatProfile.create({
        data: { userId, audio, video, text, status: 1 },
      });
    }
  }

  async disableVIPChat(data: DisableVIPChatDto) {
    const { userId } = data;
    const existingProfile = await this.prisma.vIPChatProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.vIPChatProfile.update({
      where: { userId },
      data: { status: 0 },
    });
  }

  async checkUserVIP(data: CheckUserVIPDto) {
    const { userId } = data;
    const existingProfile = await this.prisma.vIPChatProfile.findUnique({
      where: { userId },
    });

    return { isVIP: existingProfile && existingProfile.status === 1 };
  }


  
  async getVIPChatData(data: GetVIPChatDataDto) {
    const { userId } = data;
    const existingProfile = await this.prisma.vIPChatProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('User not found');
    }

    return existingProfile;
  }
}
