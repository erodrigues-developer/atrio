import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-response.dto';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  experienceId!: string;

  @ApiProperty()
  @IsString()
  slotId!: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  partySize!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReservationListQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ReservationItemDto {
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
  dateLabel!: string;

  @ApiProperty()
  timeLabel!: string;

  @ApiProperty()
  scheduledAt!: string;

  @ApiProperty()
  locationLabel!: string;

  @ApiProperty()
  priceLabel!: string;

  @ApiProperty()
  note!: string;
}

export class ReservationListResponseDto {
  @ApiProperty({ type: [ReservationItemDto] })
  items!: ReservationItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
