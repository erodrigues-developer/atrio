import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateExperiencesTable1718300000009 implements MigrationInterface {
  private readonly table = new Table({
    name: 'experiences',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '100',
        isPrimary: true,
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
        length: '500',
        isNullable: false,
      },
      {
        name: 'category',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'time_label',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'price_label',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'badge',
        type: 'varchar',
        length: '100',
        isNullable: true,
      },
      {
        name: 'image_url',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'duration_label',
        type: 'varchar',
        length: '100',
        isNullable: true,
      },
      {
        name: 'availability_label',
        type: 'varchar',
        length: '100',
        isNullable: true,
      },
      {
        name: 'location_label',
        type: 'varchar',
        length: '150',
        isNullable: true,
      },
      {
        name: 'location_description',
        type: 'varchar',
        length: '255',
        isNullable: true,
      },
      {
        name: 'policy',
        type: 'varchar',
        length: '255',
        isNullable: true,
      },
      {
        name: 'included',
        type: 'jsonb',
        default: "'[]'::jsonb",
        isNullable: false,
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
