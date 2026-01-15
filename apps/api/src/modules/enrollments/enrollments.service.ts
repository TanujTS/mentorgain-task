import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { db } from '../../db';
import {
  enrollment,
  formResponse,
  mentorshipProgram,
  formField,
} from '../../db/schema';
import { eq, and, count } from 'drizzle-orm';
import { CreateEnrollmentDto } from './dto/enrollments.dto';
import { UserSession } from '@thallesp/nestjs-better-auth';

@Injectable()
export class EnrollmentsService {
  async findAll(programId: string | undefined, session: UserSession) {
    if (session.user.role === 'user') {
      return db.query.enrollment.findMany({
        where: eq(enrollment.userId, session.user.id),
        with: {
          mentorshipProgram: true,
          responses: {
            with: {
              formField: true,
            },
          },
        },
      });
    }

    // Admins see enrollments for their programs
    if (session.user.role === 'admin') {
      const adminPrograms = await db.query.mentorshipProgram.findMany({
        where: eq(mentorshipProgram.createdBy, session.user.id),
      });

      const programIds = adminPrograms.map((p) => p.id);

      if (programId && !programIds.includes(programId)) {
        throw new ForbiddenException(
          'You can only view enrollments for your own programs',
        );
      }

      return db.query.enrollment.findMany({
        where: programId
          ? eq(enrollment.mentorshipProgramId, programId)
          : undefined,
        with: {
          user: true,
          mentorshipProgram: true,
          responses: {
            with: {
              formField: true,
            },
          },
        },
      });
    }

    // Superadmin sees all enrollments
    return db.query.enrollment.findMany({
      where: programId
        ? eq(enrollment.mentorshipProgramId, programId)
        : undefined,
      with: {
        user: true,
        mentorshipProgram: true,
        responses: {
          with: {
            formField: true,
          },
        },
      },
    });
  }

  // Get enrollments for a specific program (admin/superadmin only)
  async findByProgram(programId: string, session: UserSession) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, programId),
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    // Admins can only view their own programs
    if (
      session.user.role === 'admin' &&
      program.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only view enrollments for your own programs',
      );
    }

    return db.query.enrollment.findMany({
      where: eq(enrollment.mentorshipProgramId, programId),
      with: {
        user: true,
        responses: {
          with: {
            formField: true,
          },
        },
      },
    });
  }

  async findOne(id: string, session: UserSession) {
    const result = await db.query.enrollment.findFirst({
      where: eq(enrollment.id, id),
      with: {
        user: true,
        mentorshipProgram: true,
        responses: {
          with: {
            formField: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    // Users can only view their own enrollments
    if (session.user.role === 'user' && result.userId !== session.user.id) {
      throw new ForbiddenException('You can only view your own enrollments');
    }

    // Admins can only view enrollments for their programs
    if (
      session.user.role === 'admin' &&
      result.mentorshipProgram.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only view enrollments for your own programs',
      );
    }

    return result;
  }

  async create(dto: CreateEnrollmentDto, session: UserSession) {
    // User can only enroll themselves
    const userId = session.user.id;

    // Check if program exists and is open
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, dto.mentorshipProgramId),
    });

    if (!program) {
      throw new NotFoundException(
        `Program with ID ${dto.mentorshipProgramId} not found`,
      );
    }

    if (program.status !== 'open') {
      throw new BadRequestException(
        'This program is not accepting enrollments',
      );
    }

    // Check if user already enrolled
    const existingEnrollment = await db.query.enrollment.findFirst({
      where: and(
        eq(enrollment.userId, userId),
        eq(enrollment.mentorshipProgramId, dto.mentorshipProgramId),
      ),
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this program');
    }

    // Check if program is full
    const [{ enrollmentCount }] = await db
      .select({ enrollmentCount: count() })
      .from(enrollment)
      .where(eq(enrollment.mentorshipProgramId, dto.mentorshipProgramId));

    if (enrollmentCount >= program.maxParticipants) {
      throw new BadRequestException('This program is full');
    }

    // Validate required form fields
    const requiredFields = await db.query.formField.findMany({
      where: and(
        eq(formField.mentorshipProgramId, dto.mentorshipProgramId),
        eq(formField.isRequired, true),
      ),
    });

    const providedFieldIds = dto.responses?.map((r) => r.formFieldId) ?? [];
    const missingRequired = requiredFields.filter(
      (f) => !providedFieldIds.includes(f.id),
    );

    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingRequired.map((f) => f.title).join(', ')}`,
      );
    }

    return db.transaction(async (tx) => {
      const [newEnrollment] = await tx
        .insert(enrollment)
        .values({
          userId,
          mentorshipProgramId: dto.mentorshipProgramId,
        })
        .returning();

      if (dto.responses && dto.responses.length > 0) {
        await tx.insert(formResponse).values(
          dto.responses.map((response) => ({
            enrollmentId: newEnrollment.id,
            formFieldId: response.formFieldId,
            textResponse: response.textResponse,
            numberResponse: response.numberResponse,
            selectResponse: response.selectResponse,
            multiSelectResponse: response.multiSelectResponse,
            fileResponse: response.fileResponse,
          })),
        );
      }

      // Return enrollment with responses
      return tx.query.enrollment.findFirst({
        where: eq(enrollment.id, newEnrollment.id),
        with: {
          mentorshipProgram: true,
          responses: {
            with: {
              formField: true,
            },
          },
        },
      });
    });
  }

  async withdraw(id: string, session: UserSession) {
    const result = await db.query.enrollment.findFirst({
      where: eq(enrollment.id, id),
      with: {
        mentorshipProgram: true,
      },
    });

    if (!result) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    if (session.user.role === 'user' && result.userId !== session.user.id) {
      throw new ForbiddenException('You can only withdraw your own enrollment');
    }

    if (
      session.user.role === 'admin' &&
      result.mentorshipProgram.createdBy !== session.user.id &&
      result.userId !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only withdraw enrollments from your own programs',
      );
    }

    await db.delete(enrollment).where(eq(enrollment.id, id));

    return { message: 'Enrollment withdrawn successfully' };
  }

  async updateStatus(
    id: string,
    status: 'accepted' | 'rejected',
    session: UserSession,
  ) {
    const result = await db.query.enrollment.findFirst({
      where: eq(enrollment.id, id),
      with: {
        mentorshipProgram: true,
      },
    });

    if (!result) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    // Admins can only update status for their own programs
    if (
      session.user.role === 'admin' &&
      result.mentorshipProgram.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only accept/reject enrollments for your own programs',
      );
    }

    // If accepting, check if program is full
    if (status === 'accepted') {
      const [{ acceptedCount }] = await db
        .select({ acceptedCount: count() })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.mentorshipProgramId, result.mentorshipProgramId),
            eq(enrollment.status, 'accepted'),
          ),
        );

      if (acceptedCount >= result.mentorshipProgram.maxParticipants) {
        throw new BadRequestException(
          'Cannot accept: program has reached maximum participants',
        );
      }
    }

    const [updated] = await db
      .update(enrollment)
      .set({ status })
      .where(eq(enrollment.id, id))
      .returning();

    return updated;
  }
}
