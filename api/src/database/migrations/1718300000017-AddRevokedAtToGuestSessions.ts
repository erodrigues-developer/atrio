import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRevokedAtToGuestSessions1718300000017 implements MigrationInterface {
  private readonly column = new TableColumn({
    name: 'revoked_at',
    type: 'timestamptz',
    isNullable: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('guest_sessions');

    if (table && !table.findColumnByName(this.column.name)) {
      await queryRunner.addColumn('guest_sessions', this.column);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('guest_sessions');

    if (table?.findColumnByName(this.column.name)) {
      await queryRunner.dropColumn('guest_sessions', this.column.name);
    }
  }
}
