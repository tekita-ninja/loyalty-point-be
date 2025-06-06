import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class SetRoleMenuDto {
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @IsArray()
  @IsString({ each: true })
  menuIds: string[];
}

export class SetRolePermissionDto {
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
