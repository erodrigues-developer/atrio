import { Controller, Get, Param, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { ServiceDetailResponseDto, ServiceListResponseDto, ServicesQueryDto } from '../dto/services.dto';
import { ServiceCatalogService } from '../services/service-catalog.service';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: ServiceListResponseDto })
  async listServices(@Query() _query: ServicesQueryDto) {
    return this.serviceCatalogService.listServices();
  }

  @Get(':serviceId')
  @Version('1')
  @ApiOkResponse({ type: ServiceDetailResponseDto })
  async getService(@Param('serviceId') serviceId: string, @Query() _query: ServicesQueryDto) {
    return this.serviceCatalogService.getService(serviceId);
  }
}
