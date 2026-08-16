import { Controller, Get, Query, Res, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { AdminReportQueryDto } from '../dto/admin-reports.dto';
import { AdminReportsService } from '../services/admin-reports.service';

@ApiTags('admin reports')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('stays.csv')
  @Version('1')
  @ApiProduces('text/csv')
  async stays(@CurrentAdminSession() session: AdminSessionContext, @Query() query: AdminReportQueryDto, @Res() response: Response) {
    this.sendCsv(response, 'stays.csv', await this.adminReportsService.staysCsv(session, query));
  }

  @Get('requests.csv')
  @Version('1')
  @ApiProduces('text/csv')
  async requests(@CurrentAdminSession() session: AdminSessionContext, @Query() query: AdminReportQueryDto, @Res() response: Response) {
    this.sendCsv(response, 'requests.csv', await this.adminReportsService.requestsCsv(session, query));
  }

  @Get('reservations.csv')
  @Version('1')
  @ApiProduces('text/csv')
  async reservations(@CurrentAdminSession() session: AdminSessionContext, @Query() query: AdminReportQueryDto, @Res() response: Response) {
    this.sendCsv(response, 'reservations.csv', await this.adminReportsService.reservationsCsv(session, query));
  }

  private sendCsv(response: Response, filename: string, csv: string) {
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.send(csv);
  }
}

