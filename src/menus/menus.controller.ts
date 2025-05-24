import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';
import { PermissionGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }
  @Get('role-menu/:id')
  findRoleMenu(@Param('id') id: string) {
    return this.menusService.findRoleMenu(id);
  }

  @Get('all')
  findAll(@Query() query?: { withTree?: number }) {
    return this.menusService.findAll(query);
  }
  @Get()
  findMany(@Query() query: QueryParamDto) {
    return this.menusService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }

  @Post('set-role')
  replaceRoleMenu(@Body() body: { menuId: string; roleIds: string[] }) {
    return this.menusService.replaceRoleMenu(body);
  }
}
