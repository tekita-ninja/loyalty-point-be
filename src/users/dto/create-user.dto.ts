import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/IsStrongPassword';
export class JwtPayload {
  userId: string;
}
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
  })
  password: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
export class CreateUserByAdminDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  email: string;
}
