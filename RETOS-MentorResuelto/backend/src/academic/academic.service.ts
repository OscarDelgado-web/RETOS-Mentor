import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  findAllCareers() {
    return this.prisma.career.findMany();
  }

  findSubjectsByCareer(careerId: number) {
    return this.prisma.subject.findMany({
      where: { careerId },
    });
  }

  findTopicsBySubject(subjectId: number) {
    return this.prisma.topic.findMany({
      where: { subjectId },
    });
  }
}