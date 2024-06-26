import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { PrismaService } from './Prisma.Service';

class SignupValidationDTO extends createZodDto(
  z.object({
    username: z.string().optional(),
    email: z
      .string()
      .email()
      .optional()
      .transform((email) => email?.toLocaleLowerCase()),
  }),
) {}




@Controller()
export class AppController {
  constructor(private readonly pService: PrismaService) {}

  @Post('signup_validation')
  async signupValid(@Body() body: SignupValidationDTO) {
    const user = await this.pService.user.findFirst({
      where: {
        ...body,
        activated: true,
      },
    });

    if (!user || user.verified != true) return null;
    return user;
  }
}
