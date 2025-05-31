// schedule.module.ts
import { Module } from '@nestjs/common';
import { TempCleanupService } from './schedule.service';

@Module({
  providers: [TempCleanupService], // cukup di sini saja
})
export class ScheduleTasksModule {}
