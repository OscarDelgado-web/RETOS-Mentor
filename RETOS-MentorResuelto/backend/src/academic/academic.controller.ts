import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { AcademicService } from './academic.service';

@Controller()
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get('careers')
  getCareers() {
    return this.academicService.findAllCareers();
  }

  @Get('subjects')
  getSubjects(@Query('careerId', ParseIntPipe) careerId: number) {
    return this.academicService.findSubjectsByCareer(careerId);
  }

  @Get('topics')
  getTopics(@Query('subjectId', ParseIntPipe) subjectId: number) {
    return this.academicService.findTopicsBySubject(subjectId);
  }
}