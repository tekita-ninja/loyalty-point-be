import { Controller } from "@nestjs/common";
import { OtpService } from "./otp.service";

@Controller('/api/otp/get-otp')
export class OtpController {
    constructor(
        private otpService: OtpService
    ){}
}