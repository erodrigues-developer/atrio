import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateReservationsTable1718300000013 implements MigrationInterface {
  private readonly table = new Table({
    name: 'reservations',
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
        name: 'experience_id',
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
        name: 'date_label',
        type: 'varchar',
        length: '50',
        isNullable: false,
      },
      {
        name: 'time_label',
        type: 'varchar',
        length: '10',
        isNullable: false,
      },
      {
        name: 'scheduled_at',
        type: 'timestamptz',
        isNullable: false,
      },
      {
        name: 'location_label',
        type: 'varchar',
        length: '150',
        isNullable: false,
      },
      {
        name: 'price_label',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'note',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'guest_note',
        type: 'varchar',
        length: '255',
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
      {
        columnNames: ['experience_id'],
        referencedTableName: 'experiences',
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
