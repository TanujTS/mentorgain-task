import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [ProgramsModule],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
