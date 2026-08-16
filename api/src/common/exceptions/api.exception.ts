import { HttpException, HttpStatus } from '@nestjs/common';

export type ApiExceptionDetail = {
  field?: string;
  message: string;
};

export class ApiException extends HttpException {
  constructor(
    public readonly statusCode: HttpStatus,
    public readonly code: string,
    override readonly message: string,
    public readonly details: ApiExceptionDetail[] = [],
  ) {
    super(message, statusCode);
  }
}
