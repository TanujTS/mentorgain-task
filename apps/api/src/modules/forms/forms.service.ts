import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../../db';
import { formField, mentorshipProgram } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/forms.dto';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FormsService {
  constructor() {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async getFormFields(programId: string, session: UserSession) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, programId),
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    if (session.user.role === 'user' && program.status === 'closed') {
      throw new ForbiddenException('This program is not available');
    }

    const fields = await db.query.formField.findMany({
      where: eq(formField.mentorshipProgramId, programId),
      orderBy: (formField, { asc }) => [asc(formField.order)],
    });

    return fields;
  }

  async createFormFields(
    programId: string,
    fields: CreateFormFieldDto[],
    session: UserSession,
  ) {
    const program = await db.query.mentorshipProgram.findFirst({
      where: eq(mentorshipProgram.id, programId),
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    if (
      session.user.role === 'admin' &&
      program.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only add form fields to your own programs',
      );
    }

    const existingFields = await db.query.formField.findMany({
      where: eq(formField.mentorshipProgramId, programId),
      orderBy: (formField, { desc }) => [desc(formField.order)],
    });

    const startOrder =
      existingFields.length > 0 ? existingFields[0].order + 1 : 0;

    const createdFields = await db
      .insert(formField)
      .values(
        fields.map((field, index) => ({
          mentorshipProgramId: programId,
          title: field.title,
          description: field.description,
          fieldType: field.fieldType,
          options: field.options,
          isRequired: field.isRequired ?? false,
          order: field.order ?? startOrder + index,
        })),
      )
      .returning();

    return createdFields;
  }

  async updateFormField(
    id: string,
    dto: UpdateFormFieldDto,
    session: UserSession,
  ) {
    const field = await db.query.formField.findFirst({
      where: eq(formField.id, id),
      with: {
        mentorshipProgram: true,
      },
    });

    if (!field) {
      throw new NotFoundException(`Form field with ID ${id} not found`);
    }

    if (
      session.user.role === 'admin' &&
      field.mentorshipProgram.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only update form fields in your own programs',
      );
    }

    const [updated] = await db
      .update(formField)
      .set({
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.fieldType && { fieldType: dto.fieldType }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
        ...(dto.order !== undefined && { order: dto.order }),
      })
      .where(eq(formField.id, id))
      .returning();

    return updated;
  }

  async deleteFormField(id: string, session: UserSession) {
    const field = await db.query.formField.findFirst({
      where: eq(formField.id, id),
      with: {
        mentorshipProgram: true,
      },
    });

    if (!field) {
      throw new NotFoundException(`Form field with ID ${id} not found`);
    }

    if (
      session.user.role === 'admin' &&
      field.mentorshipProgram.createdBy !== session.user.id
    ) {
      throw new ForbiddenException(
        'You can only delete form fields in your own programs',
      );
    }

    await db.delete(formField).where(eq(formField.id, id));

    return { message: 'Form field deleted successfully' };
  }

  handleFileUpload(file: Express.Multer.File, session: UserSession) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  deleteFile(filename: string) {
    const filePath = join(process.cwd(), 'uploads', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
