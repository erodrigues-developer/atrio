import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAtrioSchema1718300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
  }
}
