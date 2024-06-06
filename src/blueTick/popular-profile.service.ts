import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { AssignBlueTickDTO } from './popular-profile.dto';

@Injectable()
export class PopularProfileService {
  constructor(private prisma: PrismaService) {}

  async assignBlueTick(data: AssignBlueTickDTO) {
    const existingProfile = await this.prisma.popularProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      return this.prisma.popularProfile.update({
        where: { userId: data.userId },
        data: { status: data.status },
      });
    } else {
      return this.prisma.popularProfile.create({
        data: {
          userId: data.userId,
          status: data.status,
          createdAt: new Date(),
        },
      });
    }
  }

  async getBlueTickStatusByUserId(userId: string) {
    const profile = await this.prisma.popularProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { userId: 'USer not found', status: 404 };
    }

    return { userId: profile.userId, status: profile.status };
  }
}
