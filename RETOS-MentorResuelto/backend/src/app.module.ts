import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { AcademicModule } from './academic/academic.module';
import { MentorModule } from './mentor/mentor.module';

@Module({
  imports: [PrismaModule, StudentsModule, AcademicModule, MentorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}