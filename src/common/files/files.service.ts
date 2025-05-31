import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { FileDto } from './dto/file.dto';
import * as fs from 'fs-extra';

@Injectable()
export class FileService {
  async uploadFile(file: Express.Multer.File, data: FileDto) {
    const targetFolder = data.folder;
    if (!targetFolder) {
      throw new BadRequestException('Missing folder');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\s+/g, '-'); // ganti spasi jadi dash, opsional
    const fileName = `${uniqueSuffix}-${originalName}`;

    const newPath = join(
      process.cwd(),
      'uploads',
      '_temp',
      targetFolder,
      fileName,
    );
    await fs.mkdirSync(
      join(process.cwd(), 'uploads', '_temp', targetFolder),
      { recursive: true },
    );
    await fs.renameSync(file.path, newPath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const relativePath = `_temp/${targetFolder}/${fileName}`;
    const url = `${baseUrl}/uploads/${relativePath}`;

    return { url };
  }

  async copyFileFromTemp(url: string) {
    const parsedUrl = new URL(url); // butuh URL penuh agar bisa parse
    const path = parsedUrl.pathname;

    if (!path || !path.startsWith('/uploads/_temp/')) {
      throw new BadRequestException(
        'URL gambar tidak valid atau bukan dari folder _temp',
      );
    }

    const parts = path.split('/');
    const namaFolder = parts[3];
    const filename = parts[4];

    const tempPath = join(
      process.cwd(),
      'uploads',
      '_temp',
      namaFolder,
      filename,
    );
    const finalFolder = join(
      process.cwd(),
      'uploads',
      namaFolder,
    );
    const finalPath = join(finalFolder, filename);

    await fs.ensureDir(finalFolder);
    await fs.copy(tempPath, finalPath, { overwrite: true });

    const publicUrl = `uploads/${namaFolder}/${filename}`;

    return publicUrl;
  }

  async isFileExistsInUpload(url: string): Promise<boolean> {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;

      let relativePath = path;

      if (path.startsWith('/uploads/_temp/')) {
        const parts = path.split('/');
        if (parts.length < 5) {
          throw new BadRequestException('Struktur URL tidak sesuai');
        }

        const namaFolder = parts[3];
        const filename = parts[4];

        relativePath = `/uploads/${namaFolder}/${filename}`;
      }

      const filePath = join(process.cwd(), relativePath);
      await fs.pathExists(filePath);

      return false;
    } catch (error) {
      return false;
    }
  }
}
