import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInternalNoteToStayRequests1718300000019 implements MigrationInterface {
  private readonly column = new TableColumn({
    name: 'internal_note',
    type: 'varchar',
    length: '500',
    isNullable: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('stay_requests');

    if (table && !table.findColumnByName(this.column.name)) {
      await queryRunner.addColumn('stay_requests', this.column);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('stay_requests');

    if (table?.findColumnByName(this.column.name)) {
      await queryRunner.dropColumn('stay_requests', this.column.name);
    }
  }
}
