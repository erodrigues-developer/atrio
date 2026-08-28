import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHotelStayTimesAndUsefulInfoUniqueness1718300000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumn(queryRunner, 'hotels', new TableColumn({
      name: 'check_in_time', type: 'varchar', length: '5', default: "'14:00'",
    }));
    await this.addColumn(queryRunner, 'hotels', new TableColumn({
      name: 'check_out_time', type: 'varchar', length: '5', default: "'12:00'",
    }));
    await this.addColumn(queryRunner, 'hotels', new TableColumn({
      name: 'timezone', type: 'varchar', length: '80', default: "'America/Sao_Paulo'",
    }));
    await this.addColumn(queryRunner, 'stays', new TableColumn({
      name: 'check_in_time', type: 'varchar', length: '5', default: "'14:00'",
    }));

    await queryRunner.query(`
      UPDATE hotels h
      SET check_out_time = latest.check_out_time
      FROM (
        SELECT DISTINCT ON (hotel_id) hotel_id, check_out_time
        FROM stays
        ORDER BY hotel_id, check_in_date DESC
      ) latest
      WHERE h.public_id = latest.hotel_id
    `);
    await queryRunner.query(`
      UPDATE stays s
      SET check_in_time = h.check_in_time, check_out_time = h.check_out_time
      FROM hotels h
      WHERE h.public_id = s.hotel_id
    `);

    // Keeps the earliest record and removes only semantically identical entries.
    await queryRunner.query(`
      DELETE FROM hotel_useful_info duplicate
      USING hotel_useful_info original
      WHERE duplicate.hotel_id = original.hotel_id
        AND duplicate.scope = original.scope
        AND LOWER(BTRIM(duplicate.title)) = LOWER(BTRIM(original.title))
        AND LOWER(BTRIM(duplicate.description)) = LOWER(BTRIM(original.description))
        AND duplicate.id > original.id
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hotel_useful_info_content
      ON hotel_useful_info (
        hotel_id,
        scope,
        LOWER(BTRIM(title)),
        LOWER(BTRIM(description))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS uq_hotel_useful_info_content');
    await this.dropColumn(queryRunner, 'stays', 'check_in_time');
    await this.dropColumn(queryRunner, 'hotels', 'timezone');
    await this.dropColumn(queryRunner, 'hotels', 'check_out_time');
    await this.dropColumn(queryRunner, 'hotels', 'check_in_time');
  }

  private async addColumn(queryRunner: QueryRunner, table: string, column: TableColumn) {
    if (!(await queryRunner.hasColumn(table, column.name))) await queryRunner.addColumn(table, column);
  }

  private async dropColumn(queryRunner: QueryRunner, table: string, column: string) {
    if (await queryRunner.hasColumn(table, column)) await queryRunner.dropColumn(table, column);
  }
}

