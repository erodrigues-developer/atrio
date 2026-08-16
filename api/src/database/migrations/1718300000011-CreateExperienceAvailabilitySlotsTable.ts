import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists, publicIdColumn, uuidPrimaryColumn } from './helpers/table-migration.helper';

export class CreateExperienceAvailabilitySlotsTable1718300000011 implements MigrationInterface {
  private readonly table = new Table({
    name: 'experience_availability_slots',
    columns: [
      uuidPrimaryColumn(),
      publicIdColumn(),
      {
        name: 'experience_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'date',
        type: 'date',
        isNullable: false,
      },
      {
        name: 'day_label',
        type: 'varchar',
        length: '50',
        isNullable: false,
      },
      {
        name: 'date_label',
        type: 'varchar',
        length: '50',
        isNullable: false,
      },
      {
        name: 'time',
        type: 'varchar',
        length: '10',
        isNullable: false,
      },
      {
        name: 'starts_at',
        type: 'timestamptz',
        isNullable: false,
      },
      {
        name: 'is_available',
        type: 'boolean',
        default: true,
        isNullable: false,
      },
      {
        name: 'position',
        type: 'integer',
        isNullable: false,
      },
    ],
    foreignKeys: [
      {
        columnNames: ['experience_id'],
        referencedTableName: 'experiences',
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
