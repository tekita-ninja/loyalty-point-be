// src/jobs/temp-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TempCleanupService {
  private readonly logger = new Logger(TempCleanupService.name);

  @Cron('22 2 * * *') // setiap jam 12 malam (00:00)
  handleCron() {
    const folderPath = path.join(process.cwd(),'uploads', '_temp');

    if (fs.existsSync(folderPath)) {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          this.logger.error(`Gagal membaca folder: ${err.message}`);
          return;
        }

        for (const file of files) {
          const filePath = path.join(folderPath, file);
          fs.rm(filePath, { recursive: true, force: true }, (err) => {
            if (err) {
              this.logger.error(`Gagal hapus ${filePath}: ${err.message}`);
            } else {
              this.logger.log(`Berhasil hapus: ${filePath}`);
            }
          });
        }
      });
    } else {
      this.logger.warn(`Folder tidak ditemukan: ${folderPath}`);
    }
  }
}
