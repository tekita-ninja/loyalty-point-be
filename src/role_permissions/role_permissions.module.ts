import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { RolePermissionsController } from './role_permissions.controller';
import { RolesModule } from 'src/roles/roles.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [RolesModule, PermissionsModule],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule {}
