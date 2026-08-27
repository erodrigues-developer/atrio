import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertAdminExperienceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  category!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  timeLabel!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  priceLabel!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badge?: string | null;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  imageUrl!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  durationLabel?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  availabilityLabel?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  locationLabel?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationDescription?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  policy?: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  included!: string[];

  @ApiProperty()
  @IsBoolean()
  published!: boolean;
}

export class AdminExperienceDto extends UpsertAdminExperienceDto {
  @ApiProperty()
  id!: string;
}

export class AdminExperienceQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: ['published', 'draft'], required: false })
  @IsOptional()
  @IsIn(['published', 'draft'])
  status?: 'published' | 'draft';

  @ApiProperty({ default: 1, minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ default: 10, maximum: 100, minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class AdminExperienceListResponseDto {
  @ApiProperty({ type: [AdminExperienceDto] })
  items!: AdminExperienceDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalPages!: number;
}

export class UpsertAdminCollectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  description!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string | null;

  @ApiProperty()
  @IsBoolean()
  featured!: boolean;

  @ApiProperty()
  @IsBoolean()
  published!: boolean;
}

export class AdminCollectionDto extends UpsertAdminCollectionDto {
  @ApiProperty()
  id!: string;
}

export class LinkExperienceToCollectionDto {
  @ApiProperty()
  @IsString()
  experienceId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  position!: number;
}

export class CreateAdminExperienceSlotDto {
  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiProperty()
  @IsBoolean()
  isAvailable!: boolean;

  @ApiProperty()
  @IsInt()
  @Min(1)
  position!: number;
}

export class UpdateAdminExperienceSlotDto {
  @ApiProperty()
  @IsBoolean()
  isAvailable!: boolean;
}

export class AdminExperienceSlotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  experienceId!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  dayLabel!: string;

  @ApiProperty()
  dateLabel!: string;

  @ApiProperty()
  time!: string;

  @ApiProperty()
  startsAt!: string;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty()
  position!: number;
}

export class AdminReservationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ default: 1, minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ default: 10, maximum: 100, minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class CreateAdminReservationDto {
  @ApiProperty()
  @IsString()
  stayId!: string;

  @ApiProperty()
  @IsString()
  experienceId!: string;

  @ApiProperty()
  @IsString()
  slotId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  guestNote?: string;
}

export class UpdateAdminReservationStatusDto {
  @ApiProperty()
  @IsIn([
    'requested',
    'confirmed',
    'waitlisted',
    'cancelled',
    'completed',
    'no_show',
    'rejected',
  ])
  status!: string;
}

export class AdminReservationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  stayId!: string;

  @ApiProperty()
  experienceId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  statusLabel!: string;

  @ApiProperty()
  scheduledAt!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  guestName!: string;
}

export class AdminReservationListResponseDto {
  @ApiProperty({ type: [AdminReservationDto] })
  items!: AdminReservationDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalPages!: number;
}
