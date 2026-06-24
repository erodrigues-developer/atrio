import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationMetaDto } from 'src/common/dto/pagination-response.dto';

class ConciergeQuickSuggestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  icon!: string;
}

export class ConciergeMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sender!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty()
  createdAt!: string;
}

export class ConciergeMessagesResponseDto {
  @ApiProperty({ type: [ConciergeQuickSuggestionDto] })
  quickSuggestions!: ConciergeQuickSuggestionDto[];

  @ApiProperty({ type: [ConciergeMessageDto] })
  messages!: ConciergeMessageDto[];

  @ApiProperty({ type: PaginationMetaDto, required: false })
  pagination?: PaginationMetaDto;
}

export class CreateConciergeMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class ConciergeListQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  limit?: number;
}

export class CreateConciergeMessageResponseDto {
  @ApiProperty({ type: ConciergeMessageDto })
  message!: ConciergeMessageDto;

  @ApiProperty({ type: ConciergeMessageDto })
  reply!: ConciergeMessageDto;
}
