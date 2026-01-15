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
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/programs.dto';
import { Roles, type UserSession } from '@thallesp/nestjs-better-auth';

// kind of like router here
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // GET /api/programs
  @Get()
  findAll(@Session() session: UserSession) {
    return this.programsService.findAll(session);
  }

  // GET /api/programs/:id
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.programsService.findOne(id, session);
  }

  // POST /api/programs
  @Post()
  @Roles(['admin', 'superadmin'])
  create(
    @Body() createProgramDto: CreateProgramDto,
    @Session() session: UserSession,
  ) {
    // @Body() is like req.body in Express
    // DTO (Data Transfer Object) defines the shape + validation of incoming data
    return this.programsService.create(createProgramDto, session);
  }

  // PUT /api/programs/:id
  @Put(':id')
  @Roles(['admin', 'superadmin'])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @Session() session: UserSession,
  ) {
    return this.programsService.update(id, updateProgramDto, session);
  }

  // DELETE /api/programs/:id
  @Delete(':id')
  @Roles(['admin', 'superadmin'])
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.programsService.remove(id, session);
  }
}
