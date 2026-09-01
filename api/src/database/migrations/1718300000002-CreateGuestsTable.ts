import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists, publicIdColumn, uuidPrimaryColumn } from './helpers/table-migration.helper';

export class CreateGuestsTable1718300000002 implements MigrationInterface {
  private readonly table = new Table({
    name: 'guests',
    columns: [
      uuidPrimaryColumn(),
      publicIdColumn(),
      {
        name: 'first_name',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'last_name',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'phone_number',
        type: 'varchar',
        length: '30',
        isNullable: false,
      },
      {
        name: 'masked_phone',
        type: 'varchar',
        length: '30',
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
