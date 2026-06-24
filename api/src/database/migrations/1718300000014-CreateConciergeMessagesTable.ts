import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateConciergeMessagesTable1718300000014 implements MigrationInterface {
  private readonly table = new Table({
    name: 'concierge_messages',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '100',
        isPrimary: true,
      },
      {
        name: 'stay_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'sender',
        type: 'varchar',
        length: '20',
        isNullable: false,
      },
      {
        name: 'text',
        type: 'varchar',
        length: '500',
        isNullable: false,
      },
      {
        name: 'source',
        type: 'varchar',
        length: '50',
        isNullable: true,
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        isNullable: false,
      },
    ],
    foreignKeys: [
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
