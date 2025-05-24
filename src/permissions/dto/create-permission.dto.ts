import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}
