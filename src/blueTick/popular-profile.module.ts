import { Module } from '@nestjs/common';
import { PopularProfileService } from './popular-profile.service';
import { PopularProfileController } from './popular-profile.controller';
import { PrismaService } from '../Prisma.Service';

@Module({
  controllers: [PopularProfileController],
  providers: [PopularProfileService, PrismaService],
})
export class PopularProfileModule {}
