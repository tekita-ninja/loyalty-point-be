import { Gender } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class CustomerRegisterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 6 })
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  gender: Gender;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  birthDate: Date;
}

export class CustomerLoginDto {
    @IsString()
    phone: string

    @IsString()
    password: string

}