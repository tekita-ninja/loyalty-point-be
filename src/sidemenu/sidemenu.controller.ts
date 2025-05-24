import { Controller, Get, UseGuards } from '@nestjs/common';
import { SidemenuService } from './sidemenu.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('sidemenu')
export class SidemenuController {
  constructor(private readonly sidemenuService: SidemenuService) {}
  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.sidemenuService.findAll(userId);
  }
}
