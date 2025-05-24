import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, { message: string; data: T }>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ message: string; data: T }> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      'success';

    return next.handle().pipe(
      map((data) => ({
        message,
        data,
      })),
    );
  }
}
