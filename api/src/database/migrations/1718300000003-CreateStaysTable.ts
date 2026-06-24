import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateStaysTable1718300000003 implements MigrationInterface {
  private readonly table = new Table({
    name: 'stays',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '100',
        isPrimary: true,
      },
      {
        name: 'hotel_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'guest_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'room_number',
        type: 'varchar',
        length: '20',
        isNullable: false,
      },
      {
        name: 'status',
        type: 'varchar',
        length: '30',
        isNullable: false,
      },
      {
        name: 'status_label',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'check_in_date',
        type: 'date',
        isNullable: false,
      },
      {
        name: 'check_out_date',
        type: 'date',
        isNullable: false,
      },
      {
        name: 'check_out_time',
        type: 'varchar',
        length: '10',
        isNullable: false,
      },
      {
        name: 'wifi_network',
        type: 'varchar',
        length: '150',
        isNullable: false,
      },
      {
        name: 'wifi_password',
        type: 'varchar',
        length: '150',
        isNullable: false,
      },
      {
        name: 'consumption_enabled',
        type: 'boolean',
        default: true,
        isNullable: false,
      },
      {
        name: 'consumption_view',
        type: 'varchar',
        length: '30',
        default: "'ready'",
        isNullable: false,
      },
    ],
    foreignKeys: [
      {
        columnNames: ['hotel_id'],
        referencedTableName: 'hotels',
        referencedColumnNames: ['id'],
      },
      {
        columnNames: ['guest_id'],
        referencedTableName: 'guests',
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
