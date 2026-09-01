import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGuestSoftDelete1718300000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('guests', 'deleted_at'))) {
      await queryRunner.addColumn(
        'guests',
        new TableColumn({
          name: 'deleted_at',
          type: 'timestamptz',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('guests', 'deleted_at')) {
      await queryRunner.dropColumn('guests', 'deleted_at');
    }
  }
}
