import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists, publicIdColumn, uuidPrimaryColumn } from './helpers/table-migration.helper';

export class CreateStayRequestsTable1718300000012 implements MigrationInterface {
  private readonly table = new Table({
    name: 'stay_requests',
    columns: [
      uuidPrimaryColumn(),
      publicIdColumn(),
      {
        name: 'stay_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'service_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'type',
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
        name: 'status',
        type: 'varchar',
        length: '50',
        isNullable: false,
      },
      {
        name: 'status_label',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'quantity',
        type: 'integer',
        isNullable: true,
      },
      {
        name: 'note',
        type: 'varchar',
        length: '500',
        default: "''",
        isNullable: false,
      },
      {
        name: 'room_number',
        type: 'varchar',
        length: '20',
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
        columnNames: ['stay_id'],
        referencedTableName: 'stays',
        referencedColumnNames: ['public_id'],
      },
      {
        columnNames: ['service_id'],
        referencedTableName: 'service_definitions',
        referencedColumnNames: ['public_id'],
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
