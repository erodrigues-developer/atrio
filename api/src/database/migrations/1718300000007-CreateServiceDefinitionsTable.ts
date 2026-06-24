import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateServiceDefinitionsTable1718300000007 implements MigrationInterface {
  private readonly table = new Table({
    name: 'service_definitions',
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
        length: '255',
        isNullable: false,
      },
      {
        name: 'icon',
        type: 'varchar',
        length: '60',
        isNullable: false,
      },
      {
        name: 'fulfillment_type',
        type: 'varchar',
        length: '60',
        isNullable: false,
      },
      {
        name: 'request_schema',
        type: 'jsonb',
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
