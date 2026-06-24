import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class ExperienceListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  timeLabel!: string;

  @ApiProperty()
  priceLabel!: string;

  @ApiProperty({ required: false, nullable: true })
  badge!: string | null;

  @ApiProperty()
  imageUrl!: string;
}

class ExperienceCollectionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  featured!: boolean;

  @ApiProperty({ type: [ExperienceListItemDto] })
  items!: ExperienceListItemDto[];
}

export class ExperienceCollectionsResponseDto {
  @ApiProperty({ type: [ExperienceCollectionDto] })
  collections!: ExperienceCollectionDto[];
}

export class ExperienceCollectionDetailResponseDto extends ExperienceCollectionDto {}

export class ExperienceDetailResponseDto extends ExperienceListItemDto {
  @ApiProperty({ nullable: true })
  durationLabel!: string | null;

  @ApiProperty({ nullable: true })
  availabilityLabel!: string | null;

  @ApiProperty({ nullable: true })
  locationLabel!: string | null;

  @ApiProperty({ nullable: true })
  locationDescription!: string | null;

  @ApiProperty({ type: [String] })
  included!: string[];

  @ApiProperty({ nullable: true })
  policy!: string | null;
}

class ExperienceAvailabilitySlotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  time!: string;

  @ApiProperty()
  startsAt!: string;

  @ApiProperty()
  available!: boolean;
}

class ExperienceAvailabilityDayDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  dateLabel!: string;

  @ApiProperty({ type: [ExperienceAvailabilitySlotDto] })
  slots!: ExperienceAvailabilitySlotDto[];
}

export class ExperienceAvailabilityResponseDto {
  @ApiProperty()
  experienceId!: string;

  @ApiProperty({ type: [ExperienceAvailabilityDayDto] })
  days!: ExperienceAvailabilityDayDto[];
}

export class ExperiencesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stayId?: string;
}
