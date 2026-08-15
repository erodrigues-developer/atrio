import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardMetricDto {
  @ApiProperty()
  label!: string;

  @ApiProperty()
  value!: number;

  @ApiProperty()
  helper!: string;
}

export class AdminDashboardResponseDto {
  @ApiProperty()
  hotelId!: string;

  @ApiProperty()
  hotelName!: string;

  @ApiProperty({ type: [AdminDashboardMetricDto] })
  metrics!: AdminDashboardMetricDto[];

  @ApiProperty({ type: [AdminDashboardMetricDto] })
  todayMetrics!: AdminDashboardMetricDto[];

  @ApiProperty({ type: [AdminDashboardMetricDto] })
  attentionMetrics!: AdminDashboardMetricDto[];

  @ApiProperty({ type: [Object] })
  alerts!: Array<Record<string, unknown>>;

  @ApiProperty({ type: [Object] })
  pendingRequests!: Array<Record<string, unknown>>;

  @ApiProperty({ type: [Object] })
  pendingExperiences!: Array<Record<string, unknown>>;

  @ApiProperty({ type: [Object] })
  conciergeConversations!: Array<Record<string, unknown>>;

  @ApiProperty({ type: [Object] })
  upcomingMovements!: Array<Record<string, unknown>>;
}
