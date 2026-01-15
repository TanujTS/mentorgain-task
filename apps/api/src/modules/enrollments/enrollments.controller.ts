import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  Session,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/enrollments.dto';
import { Roles, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // GET /api/enrollments - List enrollments (filtered by role)
  @Get()
  findAll(
    @Query('programId') programId: string | undefined,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.findAll(programId, session);
  }

  // GET /api/enrollments/program/:programId - List enrollments for a specific program (admin/superadmin)
  @Get('program/:programId')
  @Roles(['admin', 'superadmin'])
  findByProgram(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.findByProgram(programId, session);
  }

  // GET /api/enrollments/:id - Get single enrollment
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.findOne(id, session);
  }

  // POST /api/enrollments - Create enrollment (user enrolls themselves)
  @Post()
  create(@Body() dto: CreateEnrollmentDto, @Session() session: UserSession) {
    return this.enrollmentsService.create(dto, session);
  }

  // DELETE /api/enrollments/:id - Withdraw enrollment (user withdraws their own)
  @Delete(':id')
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.withdraw(id, session);
  }

  // PUT /api/enrollments/:id/accept - Accept enrollment (admin/superadmin)
  @Put(':id/accept')
  @Roles(['admin', 'superadmin'])
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.updateStatus(id, 'accepted', session);
  }

  // PUT /api/enrollments/:id/reject - Reject enrollment (admin/superadmin)
  @Put(':id/reject')
  @Roles(['admin', 'superadmin'])
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.enrollmentsService.updateStatus(id, 'rejected', session);
  }
}
