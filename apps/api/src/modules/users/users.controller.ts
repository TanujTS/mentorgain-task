import { Controller, Get, Param, ParseUUIDPipe, Session } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me - Get current user's info with enrollments
  @Get('me')
  getMe(@Session() session: UserSession) {
    return this.usersService.getCurrentUser(session);
  }

  // GET /api/users/me/enrollments - Get current user's enrollments with form responses
  @Get('me/enrollments')
  getMyEnrollments(@Session() session: UserSession) {
    return this.usersService.getUserEnrollments(session.user.id);
  }

  // GET /api/users/:id - Admin/Superadmin can view any user
  @Get(':id')
  @Roles(['admin', 'superadmin'])
  getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.usersService.getUserById(id, session);
  }

  // GET /api/users/:id/enrollments - Admin/Superadmin can view any user's enrollments
  @Get(':id/enrollments')
  @Roles(['admin', 'superadmin'])
  getUserEnrollments(
    @Param('id', ParseUUIDPipe) id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Session() session: UserSession,
  ) {
    return this.usersService.getUserEnrollments(id);
  }
}
