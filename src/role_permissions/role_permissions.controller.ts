import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { RolePermissionsService } from './role_permissions.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post('sign')
  sign(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionsService.signRolePermission(
      createRolePermissionDto,
    );
  }

  @Get()
  findAll() {
    return this.rolePermissionsService.findAll();
  }
}
