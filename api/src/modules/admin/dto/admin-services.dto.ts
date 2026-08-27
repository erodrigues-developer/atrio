import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminServiceDefinitionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  fulfillmentType!: string;

  @ApiProperty()
  requestSchema!: { fields: Array<Record<string, unknown>> };

  @ApiProperty()
  published!: boolean;
}

export class UpsertAdminServiceDefinitionDto {
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

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  icon!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  fulfillmentType!: string;

  @ApiProperty()
  @IsObject()
  requestSchema!: { fields: Array<Record<string, unknown>> };

  @ApiProperty()
  @IsBoolean()
  published!: boolean;
}

export class AdminServiceDefinitionQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

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

export class AdminServiceDefinitionListResponseDto {
  @ApiProperty({ type: [AdminServiceDefinitionDto] })
  items!: AdminServiceDefinitionDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalPages!: number;
}

export class AdminServiceRequestQueryDto {
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

export class UpdateAdminStayRequestStatusDto {
  @ApiProperty()
  @IsIn([
    'received',
    'accepted',
    'in_progress',
    'on_the_way',
    'completed',
    'cancelled',
    'rejected',
  ])
  status!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  internalNote?: string;
}

export class AdminStayRequestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  stayId!: string;

  @ApiProperty()
  serviceId!: string;

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

  @ApiProperty({ nullable: true })
  internalNote!: string | null;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  createdAt!: string;
}

export class AdminStayRequestListResponseDto {
  @ApiProperty({ type: [AdminStayRequestDto] })
  items!: AdminStayRequestDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalPages!: number;
}
