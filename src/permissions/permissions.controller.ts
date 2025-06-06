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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { HttpAdapterHost } from '@nestjs/core';
import { PermissionGuard } from 'src/auth/auth.guard';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('api/permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly adapterHost: HttpAdapterHost,
  ) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('all')
  findAll() {
    return this.permissionsService.findAll();
  }
  @Get()
  findMany(@Query() query: QueryParamDto) {
    return this.permissionsService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncPermissions() {
    return this.permissionsService.syncPermissions();
  }

  @Post('set-role')
  async setRole(@Body() body: { permissionId: string, roleIds: string[]}) {
    return await this.permissionsService.setRole(body)
  }

}
