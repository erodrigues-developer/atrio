import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists, publicIdColumn, uuidPrimaryColumn } from './helpers/table-migration.helper';

export class CreateAdminTables1718300000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTableIfMissing(
      queryRunner,
      new Table({
        name: 'admin_users',
        columns: [
          uuidPrimaryColumn(),
          publicIdColumn(),
          { name: 'hotel_id', type: 'varchar', length: '100', isNullable: false },
          { name: 'name', type: 'varchar', length: '150', isNullable: false },
          { name: 'email', type: 'varchar', length: '150', isNullable: false, isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'role', type: 'varchar', length: '50', isNullable: false },
          { name: 'permissions', type: 'jsonb', isNullable: false, default: "'[]'::jsonb" },
          { name: 'is_active', type: 'boolean', isNullable: false, default: true },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', isNullable: false },
        ],
        foreignKeys: [
          {
            columnNames: ['hotel_id'],
            referencedTableName: 'hotels',
            referencedColumnNames: ['public_id'],
          },
        ],
      }),
    );

    await createTableIfMissing(
      queryRunner,
      new Table({
        name: 'admin_sessions',
        columns: [
          uuidPrimaryColumn(),
          publicIdColumn(),
          { name: 'admin_user_id', type: 'varchar', length: '100', isNullable: false },
          { name: 'hotel_id', type: 'varchar', length: '100', isNullable: false },
          { name: 'access_token', type: 'varchar', length: '255', isNullable: false, isUnique: true },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false },
          { name: 'revoked_at', type: 'timestamptz', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['admin_user_id'],
            referencedTableName: 'admin_users',
            referencedColumnNames: ['public_id'],
          },
          {
            columnNames: ['hotel_id'],
            referencedTableName: 'hotels',
            referencedColumnNames: ['public_id'],
          },
        ],
      }),
    );

    await createTableIfMissing(
      queryRunner,
      new Table({
        name: 'audit_logs',
        columns: [
          uuidPrimaryColumn(),
          publicIdColumn(),
          { name: 'hotel_id', type: 'varchar', length: '100', isNullable: false },
          { name: 'admin_user_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'action', type: 'varchar', length: '100', isNullable: false },
          { name: 'resource_type', type: 'varchar', length: '100', isNullable: false },
          { name: 'resource_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'summary', type: 'varchar', length: '255', isNullable: false },
          { name: 'metadata', type: 'jsonb', isNullable: false, default: "'{}'::jsonb" },
          { name: 'created_at', type: 'timestamptz', isNullable: false },
        ],
        foreignKeys: [
          {
            columnNames: ['hotel_id'],
            referencedTableName: 'hotels',
            referencedColumnNames: ['public_id'],
          },
          {
            columnNames: ['admin_user_id'],
            referencedTableName: 'admin_users',
            referencedColumnNames: ['public_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTableIfExists(queryRunner, 'audit_logs');
    await dropTableIfExists(queryRunner, 'admin_sessions');
    await dropTableIfExists(queryRunner, 'admin_users');
  }
}
