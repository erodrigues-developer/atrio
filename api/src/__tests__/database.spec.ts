import 'reflect-metadata';
import datasource from '../database/datasource';
import seedDatasource from '../database/seed';
import { CreateUniqueSeedsTable1732310000000 } from '../database/migrations/1702310000000-CreateUniqueSeedsTable';
import { CreateAtrioSchema1718300000000 } from '../database/migrations/1718300000000-CreateAtrioSchema';
import { CreateHotelsTable1718300000001 } from '../database/migrations/1718300000001-CreateHotelsTable';
import { CreateGuestsTable1718300000002 } from '../database/migrations/1718300000002-CreateGuestsTable';
import { CreateStaysTable1718300000003 } from '../database/migrations/1718300000003-CreateStaysTable';
import { CreateStayUsefulInfoTable1718300000004 } from '../database/migrations/1718300000004-CreateStayUsefulInfoTable';
import { CreateConsumptionItemsTable1718300000005 } from '../database/migrations/1718300000005-CreateConsumptionItemsTable';
import { CreateGuestSessionsTable1718300000006 } from '../database/migrations/1718300000006-CreateGuestSessionsTable';
import { CreateServiceDefinitionsTable1718300000007 } from '../database/migrations/1718300000007-CreateServiceDefinitionsTable';
import { CreateExperienceCollectionsTable1718300000008 } from '../database/migrations/1718300000008-CreateExperienceCollectionsTable';
import { CreateExperiencesTable1718300000009 } from '../database/migrations/1718300000009-CreateExperiencesTable';
import { CreateExperienceCollectionItemsTable1718300000010 } from '../database/migrations/1718300000010-CreateExperienceCollectionItemsTable';
import { CreateExperienceAvailabilitySlotsTable1718300000011 } from '../database/migrations/1718300000011-CreateExperienceAvailabilitySlotsTable';
import { CreateStayRequestsTable1718300000012 } from '../database/migrations/1718300000012-CreateStayRequestsTable';
import { CreateReservationsTable1718300000013 } from '../database/migrations/1718300000013-CreateReservationsTable';
import { CreateConciergeMessagesTable1718300000014 } from '../database/migrations/1718300000014-CreateConciergeMessagesTable';
import { CreateAdminTables1718300000015 } from '../database/migrations/1718300000015-CreateAdminTables';
import { SeedDefaultAdminUser1718300000016 } from '../database/migrations/1718300000016-SeedDefaultAdminUser';
import { AddRevokedAtToGuestSessions1718300000017 } from '../database/migrations/1718300000017-AddRevokedAtToGuestSessions';
import { AddServicePublishing1718300000018 } from '../database/migrations/1718300000018-AddServicePublishing';
import { AddInternalNoteToStayRequests1718300000019 } from '../database/migrations/1718300000019-AddInternalNoteToStayRequests';
import { AddExperiencePublishing1718300000020 } from '../database/migrations/1718300000020-AddExperiencePublishing';
import InitialSeeder from '../database/seeds/initial.seeder';
import UniqueSeeder from '../database/seeds/unique.seeder';

describe('database setup', () => {
  it('exposes the datasource and seed datasource', () => {
    expect(datasource.options.type).toBe('postgres');
    expect(seedDatasource).toBe(datasource);
  });

  it('runs migrations up and down', async () => {
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(false),
      createTable: jest.fn(),
      dropTable: jest.fn(),
      getTable: jest.fn().mockResolvedValue({ findColumnByName: jest.fn().mockReturnValue(null) }),
      addColumn: jest.fn(),
      dropColumn: jest.fn(),
      query: jest.fn(),
    };

    const uniqueSeedsMigration = new CreateUniqueSeedsTable1732310000000();
    await uniqueSeedsMigration.up(queryRunner as never);
    expect(queryRunner.createTable).toHaveBeenCalled();
    await uniqueSeedsMigration.down(queryRunner as never);
    expect(queryRunner.dropTable).toHaveBeenCalled();

    const incrementalMigrations = [
      new CreateHotelsTable1718300000001(),
      new CreateGuestsTable1718300000002(),
      new CreateStaysTable1718300000003(),
      new CreateStayUsefulInfoTable1718300000004(),
      new CreateConsumptionItemsTable1718300000005(),
      new CreateGuestSessionsTable1718300000006(),
      new CreateServiceDefinitionsTable1718300000007(),
      new CreateExperienceCollectionsTable1718300000008(),
      new CreateExperiencesTable1718300000009(),
      new CreateExperienceCollectionItemsTable1718300000010(),
      new CreateExperienceAvailabilitySlotsTable1718300000011(),
      new CreateStayRequestsTable1718300000012(),
      new CreateReservationsTable1718300000013(),
      new CreateConciergeMessagesTable1718300000014(),
      new CreateAdminTables1718300000015(),
      new SeedDefaultAdminUser1718300000016(),
      new AddRevokedAtToGuestSessions1718300000017(),
      new AddServicePublishing1718300000018(),
      new AddInternalNoteToStayRequests1718300000019(),
      new AddExperiencePublishing1718300000020(),
    ];

    for (const migration of incrementalMigrations) {
      await migration.up(queryRunner as never);
    }

    expect(queryRunner.createTable).toHaveBeenCalledTimes(18);

    queryRunner.hasTable.mockResolvedValue(true);

    for (const migration of incrementalMigrations) {
      await migration.up(queryRunner as never);
      await migration.down(queryRunner as never);
    }

    expect(queryRunner.dropTable).toHaveBeenCalledTimes(18);

    const legacyMigration = new CreateAtrioSchema1718300000000();
    await legacyMigration.up(queryRunner as never);
    await legacyMigration.down(queryRunner as never);
    expect(queryRunner.query).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  });

  it('runs the initial seeder only once', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const dataSource = {
      query: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(undefined),
      getRepository: jest.fn().mockReturnValue({ save }),
    };
    const seeder = new InitialSeeder();

    await seeder.run(dataSource as never, {} as never);
    expect(save).toHaveBeenCalled();
    expect(dataSource.query).toHaveBeenCalledTimes(2);
  });

  it('returns early when a unique seed already exists', async () => {
    class TestUniqueSeeder extends UniqueSeeder {}

    const callback = jest.fn();
    const dataSource = {
      query: jest.fn().mockResolvedValue([{ name: 'InitialSeeder' }]),
    };

    await new TestUniqueSeeder().execute(dataSource as never, 'InitialSeeder', callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
