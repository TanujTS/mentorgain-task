import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';

@Module({
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService], // Export if other modules need to use this service
})
export class ProgramsModule {}
