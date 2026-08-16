import { QueryRunner, Table, TableColumn } from 'typeorm';

export async function createTableIfMissing(queryRunner: QueryRunner, table: Table): Promise<void> {
  if (!(await queryRunner.hasTable(table.name))) {
    await queryRunner.createTable(table);
  }
}

export async function dropTableIfExists(queryRunner: QueryRunner, tableName: string): Promise<void> {
  if (await queryRunner.hasTable(tableName)) {
    await queryRunner.dropTable(tableName, true, false, true);
  }
}

export function uuidPrimaryColumn(): TableColumn {
  return new TableColumn({
    name: 'id',
    type: 'uuid',
    isPrimary: true,
    default: 'gen_random_uuid()',
  });
}

export function publicIdColumn(length = '100'): TableColumn {
  return new TableColumn({
    name: 'public_id',
    type: 'varchar',
    length,
    isNullable: false,
    isUnique: true,
  });
}
