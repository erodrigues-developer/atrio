import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminConciergeQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateAdminConciergeMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text!: string;
}

