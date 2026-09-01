import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { ApiException } from 'src/common/exceptions/api.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Unexpected server error.';
    let details: Array<{ field?: string; message: string }> = [];

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      const exceptionResponse = exception.getResponse() as {
        message?: string[] | string;
      };
      const validationMessages = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message ?? 'Invalid request payload.'];
      details = validationMessages.map((validationMessage) => ({
        message: validationMessage,
      }));
      message = 'Invalid request payload.';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = (exception.getResponse() as { message?: string }).message ?? message;
      code = HttpStatus[status] ?? code;
    } else if (exception instanceof AxiosError) {
      message = exception.response?.data
        ? JSON.stringify(exception.response.data)
        : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody = {
      error: {
        code,
        message,
        ...(details.length > 0 && { details }),
      },
    };

    this.logger.error(
      `${request.method} ${request.url} -> ${status} ${message}`,
      exception?.stack,
    );

    response.status(status).json(responseBody);
  }
}
