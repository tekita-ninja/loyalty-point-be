import { Module } from '@nestjs/common';
import { SidemenuService } from './sidemenu.service';
import { SidemenuController } from './sidemenu.controller';

@Module({
  controllers: [SidemenuController],
  providers: [SidemenuService],
})
export class SidemenuModule {}
