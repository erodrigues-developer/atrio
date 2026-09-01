import 'reflect-metadata';

describe('main bootstrap', () => {
  it('bootstraps nest with swagger and versioning', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const useGlobalPipes = jest.fn();
    const enableVersioning = jest.fn();
    const enableCors = jest.fn();
    const useGlobalInterceptors = jest.fn();
    const select = jest.fn();
    const get = jest.fn().mockReturnValue({
      get: jest.fn((key: string) => {
        const values: Record<string, unknown> = {
          'app.isLocal': true,
          'app.cors.allowedOrigins': [],
          'app.cors.allowCredentials': true,
        };

        return values[key];
      }),
    });
    const app = {
      get,
      enableCors,
      useGlobalPipes,
      enableVersioning,
      useGlobalInterceptors,
      select,
      listen,
    };
    const create = jest.fn().mockResolvedValue(app);
    const createDocument = jest.fn().mockReturnValue({});
    const setup = jest.fn();
    const useContainer = jest.fn();

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create },
    }));
    jest.doMock('@nestjs/swagger', () => ({
      ...jest.requireActual('@nestjs/swagger'),
      DocumentBuilder: class {
        setTitle() {
          return this;
        }
        setDescription() {
          return this;
        }
        setVersion() {
          return this;
        }
        addBearerAuth() {
          return this;
        }
        build() {
          return {};
        }
      },
      SwaggerModule: {
        createDocument,
        setup,
      },
    }));
    jest.doMock('class-validator', () => ({
      ...jest.requireActual('class-validator'),
      useContainer,
    }));

    await jest.isolateModulesAsync(async () => {
      await import('../main');
    });

    expect(create).toHaveBeenCalled();
    expect(enableVersioning).toHaveBeenCalled();
    expect(useGlobalPipes).toHaveBeenCalled();
    expect(createDocument).toHaveBeenCalled();
    expect(setup).toHaveBeenCalled();
    expect(useContainer).toHaveBeenCalled();
    expect(listen).toHaveBeenCalled();

    jest.resetModules();
    jest.dontMock('@nestjs/core');
    jest.dontMock('@nestjs/swagger');
    jest.dontMock('class-validator');
  });
});
