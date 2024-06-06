import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from 'src/firebase';
import { SaveOptions } from '@google-cloud/storage';
import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

class AddPostDTO extends createZodDto(
  z.object({
    caption: z.string().optional(),
    url: z.string().url(),
    mimetype: z.string(),
  }),
) {}

@Controller('post')
export class PostController {
  constructor(private pService: PrismaService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async addPost(@Param('id') id, @Body() body: AddPostDTO) {
    const res = await this.pService.post.create({
      data: {
        path: body.url,
        userId: id,
        created: new Date().toISOString(),
        mimetype: body.mimetype,
        caption: body.caption,
      },
    });

    return res;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async deletePost(@Param('id') id) {
    const res = await this.pService.post.delete({
      where: { id },
    });

    if (!res) throw new NotFoundException();

    const file = bucket.file(res.path);
    await file.delete();

    return { success: true };
  }

  @Get(':username')
  async getPostRelatedToUser(@Param('username') username, @Req() req) {
    const page = parseInt(req.query.page) || 0;
    const perPage = 10;

    const posts = await this.pService.post.findMany({
      where: {
        User: { username },
      },

      include: {
        User: true,
      },

      skip: page * perPage,
      take: perPage,

      orderBy: {
        created: 'desc',
      },
    });

    return {
      page,
      perPage,
      total: await this.pService.post.count({
        where: { User: { username } },
      }),
      posts,
    };
  }
}
