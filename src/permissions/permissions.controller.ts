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
    const { httpAdapter } = this.adapterHost;
    const router = httpAdapter.getInstance()?._router;

    if (!router) return 'Router not found';
    const stack = router.stack;
    const routes = stack
      .filter((layer) => layer.route)
      .flatMap((layer) => {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods).filter(
          (method) => layer.route.methods[method],
        );
        return methods.map((method) => {
          const onlyPath = path.replace(/^\/v1\//, '');
          return {
            method: method.toUpperCase(),
            path: onlyPath,
            code: `${method.toUpperCase()}_${onlyPath}`,
            name: `${method.toUpperCase()}_${onlyPath}`,
          };
        });
      });
    return this.permissionsService.syncPermissions(routes);
  }
}
