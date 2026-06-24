import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ServicesController } from './controllers/services.controller';
import { ServiceDefinition } from './entities/service-definition.entity';
import { ServiceCatalogRepository } from './repositories/service-catalog.repository';
import { ServiceCatalogService } from './services/service-catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceDefinition]), AuthModule],
  controllers: [ServicesController],
  providers: [ServiceCatalogRepository, ServiceCatalogService],
  exports: [ServiceCatalogRepository, ServiceCatalogService],
})
export class ServicesModule {}
