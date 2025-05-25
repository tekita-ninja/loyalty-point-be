import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Request } from 'express';
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login success')
  signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @Post('register')
  @ResponseMessage('User created successfully')
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Headers('refresh_token') refresh_token: string) {
    return this.authService.refreshToken(refresh_token);
  }
  @Get('logout')
  signout(@Req() req: Request) {
    return this.authService.signout(req);
  }
}
