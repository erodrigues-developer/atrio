import { Controller, Get, Param, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import {
  ExperienceAvailabilityResponseDto,
  ExperienceCollectionDetailResponseDto,
  ExperienceCollectionsResponseDto,
  ExperienceDetailResponseDto,
  ExperiencesQueryDto,
} from '../dto/experiences.dto';
import { ExperiencesService } from '../services/experiences.service';

@ApiTags('experiences')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get('collections')
  @Version('1')
  @ApiOkResponse({ type: ExperienceCollectionsResponseDto })
  async listCollections(@Query() _query: ExperiencesQueryDto) {
    return this.experiencesService.listCollections();
  }

  @Get('collections/:collectionId')
  @Version('1')
  @ApiOkResponse({ type: ExperienceCollectionDetailResponseDto })
  async getCollection(@Param('collectionId') collectionId: string, @Query() _query: ExperiencesQueryDto) {
    return this.experiencesService.getCollection(collectionId);
  }

  @Get(':experienceId')
  @Version('1')
  @ApiOkResponse({ type: ExperienceDetailResponseDto })
  async getExperience(@Param('experienceId') experienceId: string, @Query() _query: ExperiencesQueryDto) {
    return this.experiencesService.getExperience(experienceId);
  }

  @Get(':experienceId/availability')
  @Version('1')
  @ApiOkResponse({ type: ExperienceAvailabilityResponseDto })
  async getAvailability(@Param('experienceId') experienceId: string, @Query() _query: ExperiencesQueryDto) {
    return this.experiencesService.getAvailability(experienceId);
  }
}
