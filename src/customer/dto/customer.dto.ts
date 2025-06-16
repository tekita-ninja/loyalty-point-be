import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';
import { Gender } from 'src/common/enum/Gender';

export class CustomerUpdateProfileDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  gender?: Gender;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate: Date;

  @IsEmail()
  @IsOptional()
  email?: string;
}
