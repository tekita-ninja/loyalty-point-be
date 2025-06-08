import { Body, Controller, Post } from '@nestjs/common';
import { AuthCustomerService } from './auth.customer.service';
import {
  CheckNumberDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  VerifyOtpDto,
} from './dto/customer.dto';
import { GetToken } from 'src/common/decorators/get-token.decorator';

@Controller('api/auth/customer')
export class AuthCustomerController {
  constructor(private authCustomerService: AuthCustomerService) {}

  @Post('check-phone')
  async checkPhoneNumber(@Body() body: CheckNumberDto) {
    return await this.authCustomerService.checkPhoneNumber(body);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authCustomerService.verifyOtp(body);
  }

  @Post('register')
  async signUp(@GetToken() token: string, @Body() body: CustomerRegisterDto) {
    return this.authCustomerService.signUp(token, body);
  }

  @Post('login')
  async signIn(@Body() body: CustomerLoginDto) {
    return this.authCustomerService.signIn(body);
  }
}
