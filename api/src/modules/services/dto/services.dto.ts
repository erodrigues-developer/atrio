import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class RequestSchemaFieldDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ required: false })
  label?: string;

  @ApiProperty({ required: false })
  min?: number;

  @ApiProperty({ required: false })
  max?: number;

  @ApiProperty({ required: false })
  defaultValue?: number;

  @ApiProperty({ required: false })
  maxLength?: number;

  @ApiProperty()
  required!: boolean;
}

class RequestSchemaDto {
  @ApiProperty({ type: [RequestSchemaFieldDto] })
  fields!: RequestSchemaFieldDto[];
}

class ServiceItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty({ type: RequestSchemaDto })
  requestSchema!: RequestSchemaDto;
}

export class ServiceListResponseDto {
  @ApiProperty({ type: [ServiceItemDto] })
  items!: ServiceItemDto[];
}

export class ServiceDetailResponseDto extends ServiceItemDto {
  @ApiProperty()
  fulfillmentType!: string;
}

export class ServicesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stayId?: string;
}
