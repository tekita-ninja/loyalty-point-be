import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRoleDto, SetRoleMenuDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }
  @Get('all')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get()
  findMany(@Query() query: PaginationDto) {
    return this.rolesService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
  // extra
  @Post('set-menu')
  @HttpCode(HttpStatus.OK)
  setRole(@Body() dto: SetRoleMenuDto) {
    return this.rolesService.setRole(dto);
  }
}
