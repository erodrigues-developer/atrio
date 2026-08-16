import { ApiProperty } from '@nestjs/swagger';

class ConsumptionStateDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ required: false })
  actionLabel?: string;
}

class ConsumptionItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  amountCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  occurredAt!: string;
}

export class ConsumptionResponseDto {
  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  view!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  totalAmountCents!: number;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: [ConsumptionItemDto] })
  items!: ConsumptionItemDto[];

  @ApiProperty({ type: ConsumptionStateDto })
  emptyState!: ConsumptionStateDto;

  @ApiProperty({ type: ConsumptionStateDto })
  unavailableState!: ConsumptionStateDto;
}
