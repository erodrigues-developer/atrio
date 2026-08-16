import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultAdminUser1718300000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO admin_users (
        public_id,
        hotel_id,
        name,
        email,
        password_hash,
        role,
        permissions,
        is_active,
        last_login_at,
        created_at,
        updated_at
      )
      SELECT
        'admin_001',
        'copacabana-palace',
        'Atrio Manager',
        'admin@atrio.app',
        'pbkdf2_sha512$120000$atrio-admin-seed-salt$ffb133790918feb58ef749dcd10680b0aa9206c117110813e33c8b68d15637dc8504f8e47021da1aaa072f22f224bc4cd1adf65a958cc4c98bdb796c1c94ef42',
        'owner',
        '[
          "hotel.settings.read/write",
          "staff.read/write",
          "stays.read/write",
          "guests.read/write",
          "services.read/write",
          "requests.read/write",
          "experiences.read/write",
          "experiences.media.write",
          "reservations.read/write",
          "consumption.read/write",
          "concierge.read/write",
          "hotel.media.write",
          "reports.read"
        ]'::jsonb,
        true,
        NULL,
        NOW(),
        NOW()
      WHERE EXISTS (
        SELECT 1 FROM hotels WHERE public_id = 'copacabana-palace'
      )
      ON CONFLICT (public_id) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM admin_users WHERE public_id = 'admin_001'");
  }
}
