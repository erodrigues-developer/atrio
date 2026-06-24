import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions, runSeeders } from 'typeorm-extension';
import InitialSeeder from './seeds/initial.seeder';
dotenv.config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'atrio_postgres',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'atrio',
  synchronize: false,
  entities: ['src/modules/**/entities/*.entity{.ts,.js}'],
  logging: process.env.DB_LOG == 'true' ? true : false,
  migrations: ['src/database/migrations/*.ts'],
  seeds: [InitialSeeder],
};

const datasource = new DataSource(options);
export default datasource;
