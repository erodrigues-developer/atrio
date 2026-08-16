import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-response.dto';

export class CreateStayRequestDto {
  @ApiProperty()
  @IsString()
  serviceId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class StayRequestListQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class StayRequestItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  stayId!: string;

  @ApiProperty()
  serviceId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  statusLabel!: string;

  @ApiProperty({ nullable: true })
  quantity!: number | null;

  @ApiProperty()
  note!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  timeLabel!: string;
}

export class StayRequestListResponseDto {
  @ApiProperty({ type: [StayRequestItemDto] })
  items!: StayRequestItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
