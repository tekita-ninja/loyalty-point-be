import { IsString } from "class-validator";

export class GetOtpDto {
    @IsString()
    phone: string;
}