import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Session,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormsService } from './forms.service';
import { UpdateFormFieldDto, CreateFormFieldsDto } from './dto/forms.dto';
import { Roles, type UserSession } from '@thallesp/nestjs-better-auth';
import { diskStorage, type StorageEngine } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
const uploadStorage: StorageEngine = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // GET /api/forms/program/:programId - Get all form fields for a program
  @Get('program/:programId')
  getFormFields(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Session() session: UserSession,
  ) {
    return this.formsService.getFormFields(programId, session);
  }

  // POST /api/forms/program/:programId - Create form fields for a program
  @Post('program/:programId')
  @Roles(['admin', 'superadmin'])
  createFormFields(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Body() dto: CreateFormFieldsDto,
    @Session() session: UserSession,
  ) {
    return this.formsService.createFormFields(programId, dto.fields, session);
  }

  // PUT /api/forms/:id - Update a form field
  @Put(':id')
  @Roles(['admin', 'superadmin'])
  updateFormField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormFieldDto,
    @Session() session: UserSession,
  ) {
    return this.formsService.updateFormField(id, dto, session);
  }

  // DELETE /api/forms/:id - Delete a form field
  @Delete(':id')
  @Roles(['admin', 'superadmin'])
  deleteFormField(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.formsService.deleteFormField(id, session);
  }

  // POST /api/forms/upload - Upload a file for form response
  @Post('upload')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    return this.formsService.handleFileUpload(file, session);
  }
}
