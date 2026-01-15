import {
  Controller,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { UpdateUserRoleDto } from './dto/create-superadmin.dto';
import { Roles } from '@thallesp/nestjs-better-auth';

@Controller('superadmin')
@Roles(['superadmin'])
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  // GET /api/superadmin/stats - Platform-wide statistics
  @Get('stats')
  getStats() {
    return this.superadminService.getPlatformStats();
  }

  // GET /api/superadmin/users - List all users with pagination
  @Get('users')
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: 'user' | 'admin' | 'superadmin',
    @Query('search') search?: string,
  ) {
    return this.superadminService.listUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      role,
      search,
    });
  }

  // GET /api/superadmin/users/:id - Get detailed user info
  @Get('users/:id')
  getUserDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.getUserDetails(id);
  }

  // PATCH /api/superadmin/users/:id/role - Update user role
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.superadminService.updateUserRole(id, dto.role);
  }

  // DELETE /api/superadmin/users/:id - Delete a user
  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.deleteUser(id);
  }

  // GET /api/superadmin/admins - List all admins
  @Get('admins')
  listAdmins() {
    return this.superadminService.listAdmins();
  }

  // GET /api/superadmin/programs - List all programs with creator info
  @Get('programs')
  listAllPrograms(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'open' | 'closed',
  ) {
    return this.superadminService.listAllPrograms({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
  }

  // PATCH /api/superadmin/programs/:id/close - Force close a program
  @Patch('programs/:id/close')
  forceCloseProgram(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.forceCloseProgram(id);
  }

  // DELETE /api/superadmin/programs/:id - Delete a program
  @Delete('programs/:id')
  deleteProgram(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.deleteProgram(id);
  }

  // GET /api/superadmin/enrollments - List all enrollments
  @Get('enrollments')
  listAllEnrollments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'pending' | 'accepted' | 'rejected',
    @Query('programId') programId?: string,
  ) {
    return this.superadminService.listAllEnrollments({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      programId,
    });
  }
}
