import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { AddCommentDTO } from './comment.DTO';

@Controller('comment')
export class CommentController {
  constructor(private readonly pService: PrismaService) {}

  @Get(':postId')
  getPostIdComments(@Param('postId') postId) {
    return this.pService.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        User: {
          select: {
            username: true,
            avatarPath: true,
            id: true,
          },
        },
      },
    });
  }

  @Post(':postId')
  addACommentToAPost(
    @Param('postId') postId,
    @Req() req,
    @Body() body: AddCommentDTO,
  ) {
    try {
      return this.pService.comment.create({
        data: {
          ...body,
          created: new Date().toISOString(),
          User: {
            connect: {
              id: req.user.id,
            },
          },
          Post: {
            connect: {
              id: postId,
            },
          },
        },
        include: {
          User: {
            select: {
              username: true,
              avatarPath: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Delete(':commentId')
  deleteComment(@Param('commentId') commentId) {
    return this.pService.comment.delete({
      where: {
        id: commentId,
      },
    });
  }
}
