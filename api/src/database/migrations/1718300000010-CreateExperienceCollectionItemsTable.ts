import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createTableIfMissing, dropTableIfExists } from './helpers/table-migration.helper';

export class CreateExperienceCollectionItemsTable1718300000010 implements MigrationInterface {
  private readonly table = new Table({
    name: 'experience_collection_items',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        length: '150',
        isPrimary: true,
      },
      {
        name: 'collection_id',
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
        name: 'position',
        type: 'integer',
        isNullable: false,
      },
    ],
    foreignKeys: [
      {
        columnNames: ['collection_id'],
        referencedTableName: 'experience_collections',
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
