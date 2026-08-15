import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExperiencePublishing1718300000020 implements MigrationInterface {
  private readonly publishedColumn = new TableColumn({
    name: 'published',
    type: 'boolean',
    isNullable: false,
    default: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const experiences = await queryRunner.getTable('experiences');
    const collections = await queryRunner.getTable('experience_collections');

    if (experiences && !experiences.findColumnByName(this.publishedColumn.name)) {
      await queryRunner.addColumn('experiences', this.publishedColumn);
    }

    if (collections && !collections.findColumnByName(this.publishedColumn.name)) {
      await queryRunner.addColumn('experience_collections', this.publishedColumn);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const experiences = await queryRunner.getTable('experiences');
    const collections = await queryRunner.getTable('experience_collections');

    if (collections?.findColumnByName(this.publishedColumn.name)) {
      await queryRunner.dropColumn('experience_collections', this.publishedColumn.name);
    }

    if (experiences?.findColumnByName(this.publishedColumn.name)) {
      await queryRunner.dropColumn('experiences', this.publishedColumn.name);
    }
  }
}
