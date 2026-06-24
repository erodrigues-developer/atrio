import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateConsumptionItemsTable1718300000005 implements MigrationInterface {
  private readonly table = new Table({
    name: 'consumption_items',
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
        name: 'title',
        type: 'varchar',
        length: '150',
        isNullable: false,
      },
      {
        name: 'description',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'category',
        type: 'varchar',
        length: '50',
        isNullable: false,
      },
      {
        name: 'icon',
        type: 'varchar',
        length: '30',
        isNullable: false,
      },
      {
        name: 'amount_cents',
        type: 'integer',
        isNullable: false,
      },
      {
        name: 'currency',
        type: 'varchar',
        length: '3',
        default: "'BRL'",
        isNullable: false,
      },
      {
        name: 'occurred_at',
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
