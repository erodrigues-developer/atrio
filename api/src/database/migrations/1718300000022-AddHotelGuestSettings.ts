import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { createTableIfMissing, dropTableIfExists, publicIdColumn, uuidPrimaryColumn } from './helpers/table-migration.helper';

export class AddHotelGuestSettings1718300000022 implements MigrationInterface {
  private readonly usefulInfoTable = new Table({
    name: 'hotel_useful_info',
    columns: [
      uuidPrimaryColumn(),
      publicIdColumn(),
      {
        name: 'hotel_id',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'scope',
        type: 'varchar',
        length: '20',
        isNullable: false,
      },
      {
        name: 'title',
        type: 'varchar',
        length: '150',
        isNullable: false,
      },
      {
        name: 'description',
        type: 'varchar',
        length: '255',
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
        columnNames: ['hotel_id'],
        referencedTableName: 'hotels',
        referencedColumnNames: ['public_id'],
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(
      queryRunner,
      'hotels',
      new TableColumn({ name: 'wifi_network', type: 'varchar', length: '150', isNullable: true }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'hotels',
      new TableColumn({ name: 'wifi_password', type: 'varchar', length: '150', isNullable: true }),
    );
    await createTableIfMissing(queryRunner, this.usefulInfoTable);
    await queryRunner.query(`
      UPDATE hotels h
      SET
        wifi_network = COALESCE(h.wifi_network, s.wifi_network),
        wifi_password = COALESCE(h.wifi_password, s.wifi_password)
      FROM (
        SELECT DISTINCT ON (hotel_id) hotel_id, wifi_network, wifi_password
        FROM stays
        ORDER BY hotel_id, check_in_date DESC
      ) s
      WHERE h.public_id = s.hotel_id
    `);
    await queryRunner.query(`
      INSERT INTO hotel_useful_info (id, public_id, hotel_id, scope, title, description, position)
      SELECT gen_random_uuid(), public_id, hotel_id, scope, title, description, position
      FROM (
        SELECT DISTINCT ON (sui.public_id)
          sui.public_id,
          s.hotel_id,
          sui.scope,
          sui.title,
          sui.description,
          sui.position
        FROM stay_useful_info sui
        INNER JOIN stays s ON s.public_id = sui.stay_id
        ORDER BY sui.public_id, s.check_in_date DESC
      ) migrated
      ON CONFLICT (public_id) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTableIfExists(queryRunner, this.usefulInfoTable.name);
    await this.dropColumnIfExists(queryRunner, 'hotels', 'wifi_password');
    await this.dropColumnIfExists(queryRunner, 'hotels', 'wifi_network');
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
