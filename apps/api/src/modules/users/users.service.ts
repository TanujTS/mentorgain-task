import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { db } from '../../db';
import { user, enrollment } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { UserSession } from '@thallesp/nestjs-better-auth';

@Injectable()
export class UsersService {
  async getCurrentUser(session: UserSession) {
    const result = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        enrollments: {
          with: {
            mentorshipProgram: true,
            responses: {
              with: {
                formField: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields
    const { ...safeUser } = result;
    return safeUser;
  }

  async getUserById(id: string, session: UserSession) {
    // Admins can only view users who enrolled in their programs
    // Superadmins can view anyone
    const result = await db.query.user.findFirst({
      where: eq(user.id, id),
      with: {
        enrollments: {
          with: {
            mentorshipProgram: true,
            responses: {
              with: {
                formField: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If admin, verify they have access to this user
    if (session.user.role === 'admin') {
      const hasAccess = result.enrollments.some(
        (e) => e.mentorshipProgram.createdBy === session.user.id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You can only view users enrolled in your programs',
        );
      }
    }

    return result;
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await db.query.enrollment.findMany({
      where: eq(enrollment.userId, userId),
      with: {
        mentorshipProgram: {
          with: {
            creator: true,
            formFields: true,
          },
        },
        responses: {
          with: {
            formField: true,
          },
        },
      },
    });

    return enrollments;
  }
}
