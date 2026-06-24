import { QueryRunner, Table } from 'typeorm';

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
