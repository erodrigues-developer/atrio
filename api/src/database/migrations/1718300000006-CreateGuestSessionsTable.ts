import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateGuestSessionsTable1718300000006 implements MigrationInterface {
  private readonly table = new Table({
    name: 'guest_sessions',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '100',
        isPrimary: true,
      },
      {
        name: 'guest_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'stay_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'access_token',
        type: 'varchar',
        length: '255',
        isNullable: false,
        isUnique: true,
      },
      {
        name: 'refresh_token',
        type: 'varchar',
        length: '255',
        isNullable: false,
        isUnique: true,
      },
      {
        name: 'expires_at',
        type: 'timestamptz',
        isNullable: false,
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        isNullable: false,
      },
    ],
    foreignKeys: [
      {
        columnNames: ['guest_id'],
        referencedTableName: 'guests',
        referencedColumnNames: ['id'],
      },
      {
        columnNames: ['stay_id'],
        referencedTableName: 'stays',
        referencedColumnNames: ['id'],
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTableIfMissing(queryRunner, this.table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTableIfExists(queryRunner, this.table.name);
  }
}
