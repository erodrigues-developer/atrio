import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateHotelsTable1718300000001 implements MigrationInterface {
  private readonly table = new Table({
    name: 'hotels',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '100',
        isPrimary: true,
      },
      {
        name: 'name',
        type: 'varchar',
        length: '150',
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
