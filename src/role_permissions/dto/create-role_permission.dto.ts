import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNotEmpty()
  @IsArray()
  permissionIds: string[];

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
