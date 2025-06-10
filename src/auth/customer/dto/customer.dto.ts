import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  MaxLength,
} from 'class-validator';

export class CheckNumberDto {
  @IsPhoneNumber('ID')
  phone: string;
}

export class VerifyOtpDto {
  @IsPhoneNumber('ID')
  phone: string;

  @IsString()
  otp: string;
}

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

  @IsNumberString({},{ message: 'Password harus berupa angka' })
  @Length(6, 6, { message: 'Password harus terdiri dari 6 digit' })
  password: string;

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
  phone: string;

  @IsString()
  password: string;
}
