import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { auth } from './utils/auth';
import { ProgramsModule } from './modules/programs/programs.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UsersModule } from './modules/users/users.module';
import { FormsModule } from './modules/forms/forms.module';
import { SuperadminModule } from './modules/superadmin/superadmin.module';
import { HealthModule } from './modules/health/health.module';

//routes protected by default here
@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    // Serve uploaded files statically
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    HealthModule,
    UsersModule,
    ProgramsModule,
    FormsModule,
    EnrollmentsModule,
    SuperadminModule,
  ],
})
export class AppModule {}
