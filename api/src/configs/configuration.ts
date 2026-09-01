function parseCorsAllowedOrigins() {
  return (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default () => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    isLocal: (process.env.APP_RUNTIME ?? process.env.NODE_ENV ?? 'development') === 'local',
    runtime: process.env.APP_RUNTIME ?? process.env.NODE_ENV ?? 'development',
    cors: {
      allowedOrigins: parseCorsAllowedOrigins(),
      allowCredentials: process.env.CORS_ALLOW_CREDENTIALS !== 'false',
    },
  },
  auth: {
    accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 60 * 12),
    challengeTtlSeconds: Number(process.env.CHALLENGE_TTL_SECONDS ?? 300),
    resendCooldownSeconds: Number(process.env.CHALLENGE_RESEND_COOLDOWN_SECONDS ?? 60),
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'atrio_postgres',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    name: process.env.DATABASE_NAME ?? 'atrio',
    logging: process.env.DB_LOG === 'true',
  },
  redis: {
    schema: process.env.REDIS_SCHEMA ?? 'redis',
    host: process.env.REDIS_HOST ?? 'atrio_redis',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
  storage: {
    driver: process.env.STORAGE_DRIVER ?? 'local',
    localDirectory: process.env.LOCAL_STORAGE_DIRECTORY ?? 'storage',
    publicBaseUrl: process.env.LOCAL_STORAGE_PUBLIC_BASE_URL ?? 'http://localhost:3000/storage',
  },
  queues: {
    driver: process.env.QUEUE_DRIVER ?? 'redis',
  },
  aws: {
    accessKeyEnabled: process.env.AWS_ACCESS_KEY_ENABLED !== 'false',
    sqs: {
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION ?? 'us-east-1',
    },
    s3: {
      accessKey: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION ?? 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET ?? 'atrio-dev',
    },
  },
  logs: {
    logstashUrl: process.env.LOGSTASH_URL ?? '127.0.0.1',
    logstashPort: process.env.LOGSTASH_PORT ?? 5044,
  },
});
