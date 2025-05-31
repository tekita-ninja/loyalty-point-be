import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto } from './dto/file.dto';
import { FileService } from './files.service';

@Controller('api/file')
export class FilesController {
  constructor(private fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileDto,
  ) {
    return await this.fileService.uploadFile(file, body);
  }
}
