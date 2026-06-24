import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LogstashLogger implements LoggerService {
  log(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }

  fatal(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }

  error(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }

  warn(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }

  debug?(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }

  verbose?(message: string, ...optionalParams: unknown[]) {
    void message;
    void optionalParams;
  }
}
