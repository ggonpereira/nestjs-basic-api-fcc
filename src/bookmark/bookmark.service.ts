import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkByIdDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: { ...dto, userId },
    });
  }

  getBookmarkById(userId: number, id: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        userId,
        id,
      },
    });
  }

  async editBookmarkById(userId: number, id: number, dto: EditBookmarkByIdDto) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });

    if (!bookmark) throw new BadRequestException('No resources found');

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return await this.prisma.bookmark.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async deleteBookmarkById(userId: number, id: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });

    if (!bookmark) throw new BadRequestException('No resources found');

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    await this.prisma.bookmark.delete({
      where: {
        id,
      },
    });
  }
}
