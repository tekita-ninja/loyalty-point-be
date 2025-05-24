import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
} from 'class-validator';
export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[]; // assign menu to roles
}
