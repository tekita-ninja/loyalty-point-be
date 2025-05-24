import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/IsStrongPassword';
export class JwtPayload {
  userId: string;
}
export class SignInDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SignUpDto {
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
}
