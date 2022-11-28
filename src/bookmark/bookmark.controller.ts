import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkByIdDto } from './dto';

@Controller('bookmarks')
@UseGuards(JwtGuard)
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, id);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditBookmarkByIdDto,
  ) {
    return this.bookmarkService.editBookmarkById(userId, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.bookmarkService.deleteBookmarkById(userId, id);
  }
}
