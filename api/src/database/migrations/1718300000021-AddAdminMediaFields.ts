import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAdminMediaFields1718300000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(
      queryRunner,
      'hotels',
      new TableColumn({ name: 'logo_url', type: 'varchar', length: '255', isNullable: true }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'hotels',
      new TableColumn({ name: 'hero_image_url', type: 'varchar', length: '255', isNullable: true }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'experience_collections',
      new TableColumn({ name: 'image_url', type: 'varchar', length: '255', isNullable: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropColumnIfExists(queryRunner, 'experience_collections', 'image_url');
    await this.dropColumnIfExists(queryRunner, 'hotels', 'hero_image_url');
    await this.dropColumnIfExists(queryRunner, 'hotels', 'logo_url');
  }

  private async addColumnIfMissing(queryRunner: QueryRunner, tableName: string, column: TableColumn) {
    if (!(await queryRunner.hasColumn(tableName, column.name))) {
      await queryRunner.addColumn(tableName, column);
    }
  }

  private async dropColumnIfExists(queryRunner: QueryRunner, tableName: string, columnName: string) {
    if (await queryRunner.hasColumn(tableName, columnName)) {
      await queryRunner.dropColumn(tableName, columnName);
    }
  }
}
