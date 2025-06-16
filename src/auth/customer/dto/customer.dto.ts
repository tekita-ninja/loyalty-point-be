import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
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

  @IsNumberString({}, { message: 'Password harus berupa angka' })
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

export class CustomerChangePinDto {
  @IsNumberString({}, { message: 'Pin harus berupa angka' })
  @Length(6, 6, { message: 'OLD PIN harus terdiri dari 6 digit' })
  oldPassword: string;

  @IsNumberString({}, { message: 'Pin harus berupa angka' })
  @Length(6, 6, { message: 'NEW PIN harus terdiri dari 6 digit' })
  newPassword: string;

  @IsNumberString({}, { message: 'Pin harus berupa angka' })
  @Length(6, 6, { message: 'PIN CONFIRMATION harus terdiri dari 6 digit' })
  confirmationNewPassword: string;
}
