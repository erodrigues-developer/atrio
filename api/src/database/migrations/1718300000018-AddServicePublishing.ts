import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddServicePublishing1718300000018 implements MigrationInterface {
  private readonly column = new TableColumn({
    name: 'published',
    type: 'boolean',
    isNullable: false,
    default: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_definitions');

    if (table && !table.findColumnByName(this.column.name)) {
      await queryRunner.addColumn('service_definitions', this.column);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_definitions');

    if (table?.findColumnByName(this.column.name)) {
      await queryRunner.dropColumn('service_definitions', this.column.name);
    }
  }
}
