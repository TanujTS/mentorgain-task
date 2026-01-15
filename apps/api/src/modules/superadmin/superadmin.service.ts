import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from 'src/db';
import { eq, sql, ilike, or, and, count, SQL } from 'drizzle-orm';
import { user, mentorshipProgram, enrollment } from 'src/db/schema';

@Injectable()
export class SuperadminService {
  async getPlatformStats() {
    const [userStats] = await db
      .select({
        totalUsers: count(),
        admins: sql<number>`count(*) filter (where ${user.role} = 'admin')`,
        superadmins: sql<number>`count(*) filter (where ${user.role} = 'superadmin')`,
      })
      .from(user);

    const [programStats] = await db
      .select({
        totalPrograms: count(),
        openPrograms: sql<number>`count(*) filter (where ${mentorshipProgram.status} = 'open')`,
        closedPrograms: sql<number>`count(*) filter (where ${mentorshipProgram.status} = 'closed')`,
      })
      .from(mentorshipProgram);

    const [enrollmentStats] = await db
      .select({
        totalEnrollments: count(),
        pending: sql<number>`count(*) filter (where ${enrollment.status} = 'pending')`,
        accepted: sql<number>`count(*) filter (where ${enrollment.status} = 'accepted')`,
        rejected: sql<number>`count(*) filter (where ${enrollment.status} = 'rejected')`,
      })
      .from(enrollment);

    return {
      users: userStats,
      programs: programStats,
      enrollments: enrollmentStats,
    };
  }

  async listUsers(options: {
    page: number;
    limit: number;
    role?: 'user' | 'admin' | 'superadmin';
    search?: string;
  }) {
    const { page, limit, role, search } = options;
    const offset = (page - 1) * limit;

    const conditions: SQL<unknown>[] = [];
    if (role) {
      conditions.push(eq(user.role, role));
    }
    if (search) {
      const searchCondition = or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [users, [{ total }]] = await Promise.all([
      db.query.user.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (u, { desc }) => [desc(u.createdAt)],
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
        },
      }),
      db.select({ total: count() }).from(user).where(whereClause),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        enrollments: {
          with: {
            mentorshipProgram: {
              columns: { id: true, name: true, status: true },
            },
          },
        },
        createdPrograms: {
          columns: { id: true, name: true, status: true, createdAt: true },
        },
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'superadmin') {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const [updated] = await db
      .update(user)
      .set({ role })
      .where(eq(user.id, userId))
      .returning();

    return updated;
  }

  async deleteUser(userId: string) {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    if (foundUser.role === 'superadmin') {
      throw new BadRequestException('Cannot delete a superadmin');
    }

    await db.delete(user).where(eq(user.id, userId));

    return { message: 'User deleted successfully' };
  }

  async listAdmins() {
    return db.query.user.findMany({
      where: eq(user.role, 'admin'),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      with: {
        createdPrograms: {
          columns: { id: true, name: true, status: true },
        },
      },
    });
  }

  async listAllPrograms(options: {
    page: number;
    limit: number;
    status?: 'open' | 'closed';
  }) {
    const { page, limit, status } = options;
    const offset = (page - 1) * limit;

    const whereClause = status
      ? eq(mentorshipProgram.status, status)
      : undefined;

    const [programs, [{ total }]] = await Promise.all([
      db.query.mentorshipProgram.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        with: {
          creator: {
            columns: { id: true, name: true, email: true },
          },
          enrollments: {
            columns: { id: true },
          },
        },
      }),
      db.select({ total: count() }).from(mentorshipProgram).where(whereClause),
    ]);

    // Add enrollment count
    const programsWithCount = programs.map((p) => ({
      ...p,
      enrollmentCount: p.enrollments.length,
      enrollments: undefined, // Remove the enrollments array
    }));

    return {
      data: programsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async forceCloseProgram(programId: string) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, programId),
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.status === 'closed') {
      throw new BadRequestException('Program is already closed');
    }

    const [updated] = await db
      .update(mentorshipProgram)
      .set({ status: 'closed' })
      .where(eq(mentorshipProgram.id, programId))
      .returning();

    return updated;
  }

  async deleteProgram(programId: string) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, programId),
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    await db
      .delete(mentorshipProgram)
      .where(eq(mentorshipProgram.id, programId));

    return { message: 'Program deleted successfully' };
  }

  async listAllEnrollments(options: {
    page: number;
    limit: number;
    status?: 'pending' | 'accepted' | 'rejected';
    programId?: string;
  }) {
    const { page, limit, status, programId } = options;
    const offset = (page - 1) * limit;

    const conditions: SQL<unknown>[] = [];
    if (status) {
      conditions.push(eq(enrollment.status, status));
    }
    if (programId) {
      conditions.push(eq(enrollment.mentorshipProgramId, programId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [enrollments, [{ total }]] = await Promise.all([
      db.query.enrollment.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (e, { desc }) => [desc(e.createdAt)],
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
          mentorshipProgram: {
            columns: { id: true, name: true },
          },
        },
      }),
      db.select({ total: count() }).from(enrollment).where(whereClause),
    ]);

    return {
      data: enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
