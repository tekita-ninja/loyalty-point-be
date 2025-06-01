import { Global, Module } from '@nestjs/common';
import { FileModule } from './files/files.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [FileModule, ScheduleModule],
  exports: [FileModule, ScheduleModule],
})
export class CommonModule {}
