import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { db } from '../../db';
import { mentorshipProgram, formField } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { CreateProgramDto, UpdateProgramDto } from './dto/programs.dto';
import { UserSession } from '@thallesp/nestjs-better-auth';

// @Injectable() makes this available to use in router
// controllers (express)
@Injectable()
export class ProgramsService {
  async findAll(session: UserSession) {
    if (session.user.role === 'user') {
      const programs = await db.query.mentorshipProgram.findMany({
        where: eq(mentorshipProgram.status, 'open'),
        with: {
          creator: true,
        },
        extras: {
          enrollmentCount: sql<number>`(
      SELECT COUNT(*) FROM enrollment 
      WHERE enrollment.mentorship_program_id = ${mentorshipProgram.id}
    )`.as('enrollment_count'),
        },
      });
      return programs;
    } else if (
      session.user.role === 'admin' ||
      session.user.role === 'superadmin'
    ) {
      const programs = await db.query.mentorshipProgram.findMany({
        with: {
          creator: true,
          enrollments: true,
        },
        extras: {
          enrollmentCount: sql<number>`(
      SELECT COUNT(*) FROM enrollment 
      WHERE enrollment.mentorship_program_id = ${mentorshipProgram.id}
    )`.as('enrollment_count'),
        },
      });
      return programs;
    }
  }

  async findOne(id: string, session: UserSession) {
    const [program] = await db
      .select()
      .from(mentorshipProgram)
      .where(eq(mentorshipProgram.id, id));

    if (
      !program ||
      (session.user.role === 'user' && program.status === 'closed')
    ) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async create(dto: CreateProgramDto, session: UserSession) {
    const [program] = await db
      .insert(mentorshipProgram)
      .values({
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxParticipants: dto.maxParticipants,
        createdBy: session.user.id,
      })
      .returning();

    // Create form fields if provided
    if (dto.formFields && dto.formFields.length > 0) {
      await db.insert(formField).values(
        dto.formFields.map((field, index) => ({
          mentorshipProgramId: program.id,
          title: field.title,
          description: field.description,
          fieldType: field.fieldType,
          options: field.options,
          isRequired: field.isRequired ?? false,
          order: field.order ?? index,
        })),
      );
    }

    return program;
  }

  async update(id: string, dto: UpdateProgramDto, session: UserSession) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, id),
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    if (
      session.user.role === 'admin' &&
      program.createdBy !== session.user.id
    ) {
      throw new ForbiddenException('You can only update programs you created');
    }

    const [updated] = await db
      .update(mentorshipProgram)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.maxParticipants && { maxParticipants: dto.maxParticipants }),
        ...(dto.status && { status: dto.status }),
      })
      .where(eq(mentorshipProgram.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, session: UserSession) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, id),
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    if (
      session.user.role === 'admin' &&
      program.createdBy !== session.user.id
    ) {
      throw new ForbiddenException('You can only delete programs you created');
    }

    await db.delete(mentorshipProgram).where(eq(mentorshipProgram.id, id));

    return { message: 'Program deleted successfully' };
  }
}
