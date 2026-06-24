import 'reflect-metadata';
import { Readable } from 'stream';
import { buildTypeOrmOptions } from 'src/app.module';
import { resolveCurrentSession } from 'src/common/decorators/current-session.decorator';
import { buildRedisModuleOptions } from 'src/modules/redis/redis.module';
import { buildS3Client } from 'src/modules/s3/s3.module';
import { S3Service } from 'src/modules/s3/services/s3.service';
import { buildSqsClient } from 'src/modules/sqs/sqs.module';
import { SqsService } from 'src/modules/sqs/services/sqs.service';
import { LogstashLogger } from 'src/modules/logger/logstash.logger';
import { QueueService } from 'src/modules/queues/services/queue.service';
import { RedisFifoQueueService } from 'src/modules/queues/services/redis-fifo-queue.service';
import { SqsQueueService } from 'src/modules/queues/services/sqs-queue.service';
import { selectQueueDriver } from 'src/modules/queues/queues.module';
import RedisService from 'src/modules/redis/services/redis.service';
import { buildResourceId } from 'src/common/utils/id.util';
import { LocalStorageService } from 'src/modules/storage/services/local-storage.service';
import { S3StorageService } from 'src/modules/storage/services/s3-storage.service';
import { StorageService } from 'src/modules/storage/services/storage.service';
import { selectStorageDriver } from 'src/modules/storage/storage.module';

jest.mock('src/common/utils/id.util', () => ({
  buildResourceId: jest.fn(() => 'dedupe'),
}));

describe('infrastructure adapters', () => {
  it('covers factories and utility decorators', async () => {
    const configService = {
      get: jest.fn((key: string) =>
        ({
          'database.host': 'db',
          'database.port': 5432,
          'database.username': 'postgres',
          'database.password': 'postgres',
          'database.name': 'atrio',
          'database.logging': false,
          'redis.schema': 'redis',
          'redis.host': 'redis',
          'redis.port': 6379,
          'aws.accessKeyEnabled': false,
          'aws.s3.region': 'us-east-1',
          'aws.sqs.region': 'us-east-1',
          'storage.driver': 'local',
          'queues.driver': 'redis',
          'storage.localDirectory': 'tmp-storage',
          'storage.publicBaseUrl': 'http://localhost/storage',
          'aws.s3.bucket': 'bucket',
        })[key],
      ),
    };

    expect(buildTypeOrmOptions(configService as never).database).toBe('atrio');
    expect(buildRedisModuleOptions(configService as never).url).toBe('redis://redis:6379');
    expect(buildS3Client(configService as never)).toBeDefined();
    expect(buildSqsClient(configService as never)).toBeDefined();
    expect(selectStorageDriver(configService as never, 'local' as never, 's3' as never)).toBe('local');
    expect(selectQueueDriver(configService as never, 'redis' as never, 'sqs' as never)).toBe('redis');
    configService.get.mockImplementation((key: string) =>
      ({
        'aws.accessKeyEnabled': true,
        'aws.s3.region': 'us-east-1',
        'aws.s3.accessKey': 'key',
        'aws.s3.secretAccessKey': 'secret',
        'aws.sqs.region': 'us-east-1',
        'aws.sqs.accessKey': 'key',
        'aws.sqs.secretAccessKey': 'secret',
        'storage.driver': 's3',
        'queues.driver': 'sqs',
      })[key],
    );
    expect(buildS3Client(configService as never)).toBeDefined();
    expect(buildSqsClient(configService as never)).toBeDefined();
    expect(selectStorageDriver(configService as never, 'local' as never, 's3' as never)).toBe('s3');
    expect(selectQueueDriver(configService as never, 'redis' as never, 'sqs' as never)).toBe('sqs');
    expect(buildRedisModuleOptions({ get: jest.fn().mockReturnValue(undefined) } as never).url).toBe(
      'redis://atrio_redis:6379',
    );

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: { stayId: 'stay_001' } }),
      }),
    };
    expect(resolveCurrentSession(context as never)).toEqual({ stayId: 'stay_001' });
  });

  it('covers redis, queue, storage, s3, sqs and logger services', async () => {
    const redisClient = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
      set: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
      rpush: jest.fn(),
      lrange: jest.fn().mockResolvedValue(['a']),
    };
    const redisService = new RedisService(redisClient as never);
    expect(await redisService.get('key')).toContain('ok');
    expect(await redisService.getJson('key')).toEqual({ ok: true });
    await redisService.set('key', 'value', 10);
    await redisService.setJson('key', { ok: true }, 10);
    await redisService.delete('key');
    await redisService.pushToQueue('queue', 'value');
    expect(await redisService.readQueue('queue')).toEqual(['a']);

    const redisQueue = new RedisFifoQueueService(redisService);
    await redisQueue.publish('queue', { ok: true });

    const sqsClient = { send: jest.fn().mockResolvedValue({}) };
    const sqsService = new SqsService({ get: jest.fn() } as never, sqsClient as never);
    await sqsService.sendMessage('message', 'group', 'dedupe', 'queueUrl');
    await sqsService.receiveMessage('queueUrl');
    await sqsService.deleteMessage('receipt', 'queueUrl');

    const sqsQueue = new SqsQueueService(sqsService);
    await sqsQueue.publish('queueUrl', { ok: true });
    expect(buildResourceId).toHaveBeenCalled();

    const queueService = new QueueService(redisQueue);
    await queueService.publish('queue', { ok: true });

    const s3Client = {
      send: jest
        .fn()
        .mockResolvedValueOnce({ Body: Readable.from([Buffer.from('hello')]) })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ Body: 'invalid' }),
    };
    const s3Service = new S3Service(s3Client as never);
    expect((await s3Service.readBinaryFile('file', 'bucket')).toString()).toBe('hello');
    await s3Service.uploadBinaryFile('file', 'bucket', Buffer.from('body'), 'text/plain');
    expect(s3Service.getPublicUrl('file', 'bucket')).toBe('https://bucket.s3.amazonaws.com/file');
    await expect(s3Service.readBinaryFile('file', 'bucket')).rejects.toThrow('Expected a stream');

    const storageConfig = {
      get: jest.fn((key: string) =>
        ({
          'storage.localDirectory': 'tmp-storage',
          'storage.publicBaseUrl': 'http://localhost/storage',
          'aws.s3.bucket': 'bucket',
        })[key],
      ),
    };
    const localStorage = new LocalStorageService(storageConfig as never);
    const s3Storage = new S3StorageService({ uploadBinaryFile: jest.fn(), getPublicUrl: jest.fn().mockReturnValue('https://bucket.s3.amazonaws.com/file') } as never, storageConfig as never);
    expect((await localStorage.uploadFile({ key: 'files/test.txt', body: Buffer.from('hello'), contentType: 'text/plain' })).url).toContain('files/test.txt');
    expect((await s3Storage.uploadFile({ key: 'file', body: Buffer.from('body'), contentType: 'text/plain' })).url).toContain('https://');
    storageConfig.get.mockReturnValue(undefined);
    expect(
      (await new LocalStorageService(storageConfig as never).uploadFile({
        key: 'default/test.txt',
        body: Buffer.from('x'),
        contentType: 'text/plain',
      })).url,
    ).toContain('default/test.txt');
    expect(
      (
        await new S3StorageService(
          { uploadBinaryFile: jest.fn(), getPublicUrl: jest.fn().mockReturnValue('https://bucket.s3.amazonaws.com/file') } as never,
          storageConfig as never,
        ).uploadFile({ key: 'file', body: Buffer.from('body'), contentType: 'text/plain' })
      ).key,
    ).toBe('file');

    const storageService = new StorageService(localStorage as never);
    expect((await storageService.uploadFile({ key: 'files/test2.txt', body: Buffer.from('world'), contentType: 'text/plain' })).key).toBe('files/test2.txt');

    const logger = new LogstashLogger();
    logger.log('log');
    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.debug?.('debug');
    logger.verbose?.('verbose');
  });
});
