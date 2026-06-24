import 'reflect-metadata';
import { BadRequestException, CallHandler, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { AxiosError } from 'axios';
import { of } from 'rxjs';
import { ApiException } from '../common/exceptions/api.exception';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { formatDayLabel, formatGreetingPeriod, formatRelativeDateLabel, formatShortDate, formatTime, formatTimeRequestLabel } from '../common/utils/date-label.util';
import { buildResourceId } from '../common/utils/id.util';
import { decodeCursor, encodeCursor, paginateItems } from '../common/utils/pagination.util';
import configuration from '../configs/configuration';
import { HttpExceptionFilter } from '../modules/utils/exceptions/http.exception.filter';
import { NewrelicInterceptor } from '../modules/utils/interceptors/newrelic.interceptor';
import { SuccessLoggingInterceptor } from '../modules/utils/interceptors/success.logging.interceptor';

describe('common utilities and infrastructure', () => {
  it('formats dates and times across branches', () => {
    const base = new Date('2026-06-13T12:00:00.000Z');
    expect(formatDayLabel(new Date('2026-06-13T12:00:00.000Z'), base)).toBe('Hoje');
    expect(formatDayLabel(new Date('2026-06-14T12:00:00.000Z'), base)).toBe('Amanhã');
    expect(formatDayLabel(new Date('2026-06-15T12:00:00.000Z'), base)).toBe('Seg');
    expect(formatShortDate(new Date('2026-06-13T12:00:00.000Z'))).toBe('13 jun');
    expect(formatRelativeDateLabel(new Date('2026-06-13T12:00:00.000Z'), base)).toBe('Hoje, 13 jun');
    expect(formatTime(new Date('2026-06-13T21:30:00.000Z'))).toBe('21:30');
    expect(formatTimeRequestLabel(new Date('2026-06-13T21:30:00.000Z'))).toBe('Solicitado às 21:30');
    expect(formatGreetingPeriod(new Date('2026-06-13T09:00:00'))).toBe('Bom dia');
    expect(formatGreetingPeriod(new Date('2026-06-13T15:00:00'))).toBe('Boa tarde');
    expect(formatGreetingPeriod(new Date('2026-06-13T20:00:00'))).toBe('Boa noite');
  });

  it('builds ids and paginates items', () => {
    expect(buildResourceId('req')).toMatch(/^req_/);
    const cursor = encodeCursor(2);
    expect(decodeCursor(cursor)).toBe(2);
    expect(decodeCursor('invalid')).toBe(0);
    expect(paginateItems([1, 2, 3], 2)).toEqual({
      items: [1, 2],
      pagination: {
        hasNextPage: true,
        nextCursor: encodeCursor(2),
      },
    });
    expect(paginateItems([1, 2, 3], 2, encodeCursor(2))).toEqual({
      items: [3],
      pagination: {
        hasNextPage: false,
        nextCursor: null,
      },
    });
  });

  it('builds configuration', () => {
    process.env.APP_RUNTIME = 'local';
    process.env.PORT = '3101';
    process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:8081,http://127.0.0.1:19006';
    const config = configuration();

    expect(config.app.isLocal).toBe(true);
    expect(config.app.port).toBe(3101);
    expect(config.app.cors.allowedOrigins).toEqual([
      'http://localhost:8081',
      'http://127.0.0.1:19006',
    ]);
    expect(config.app.cors.allowCredentials).toBe(true);
    expect(config.storage.driver).toBeDefined();
    expect(config.queues.driver).toBeDefined();
  });

  it('validates access tokens through the guard', async () => {
    const authService = {
      validateAccessToken: jest.fn().mockResolvedValue({ stayId: 'stay_001' }),
    };
    const guard = new AccessTokenGuard(authService as never);
    const request = {
      headers: {
        authorization: 'Bearer token',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toHaveProperty('authSession');

    const invalidContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(invalidContext)).rejects.toBeInstanceOf(ApiException);
  });

  it('maps exceptions to the contract envelope', () => {
    const filter = new HttpExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { method: 'GET', url: '/v1/test' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    filter.catch(new ApiException(HttpStatus.CONFLICT, 'CUSTOM', 'Conflict.'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({ error: { code: 'CUSTOM', message: 'Conflict.' } });

    filter.catch(new BadRequestException(['field should not exist']), host);
    expect(status).toHaveBeenLastCalledWith(HttpStatus.BAD_REQUEST);

    filter.catch(new HttpException('Oops', HttpStatus.NOT_FOUND), host);
    expect(status).toHaveBeenLastCalledWith(HttpStatus.NOT_FOUND);

    filter.catch(new AxiosError('network'), host);
    expect(status).toHaveBeenLastCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    filter.catch(new Error('generic'), host);
    expect(status).toHaveBeenLastCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('passes through interceptors and logs success', (done) => {
    const loggerSpy = jest.spyOn(require('@nestjs/common').Logger.prototype, 'log').mockImplementation(() => undefined);
    const interceptor = new SuccessLoggingInterceptor();
    const newrelicInterceptor = new NewrelicInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/v1/test', originalUrl: '/v1/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext;
    const next: CallHandler = {
      handle: () => of({ ok: true }),
    };

    newrelicInterceptor.intercept(context, next).subscribe((value) => {
      expect(value).toEqual({ ok: true });
    });

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toEqual({ ok: true });
      loggerSpy.mockRestore();
      done();
    });
  });
});
