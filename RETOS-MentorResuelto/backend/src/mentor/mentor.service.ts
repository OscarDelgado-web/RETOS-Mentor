import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SendMentorMessageDto {
  studentId: number;
  subjectId: number;
  topicId: number;
  message: string;
}

@Injectable()
export class MentorService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(data: SendMentorMessageDto) {
    const { studentId, subjectId, topicId, message } = data ?? {};
    if (![studentId, subjectId, topicId].every((id) => Number.isInteger(id) && id > 0) ||
      typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('studentId, subjectId, topicId and message are required');
    }

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    if (topic.subjectId !== subjectId) {
      throw new BadRequestException('Topic does not belong to the specified subject');
    }

    const progress = await this.prisma.studentTopicProgress.findUnique({
      where: {
        studentId_topicId: { studentId, topicId },
      },
    });

    const level = progress ? progress.level : 'NOT_EVALUATED';

    const answer = `Un ${topic.name} es un concepto clave. Sobre tu consulta "${message.trim()}": te lo explico según tu nivel ${level}.`;

    return {
      answer,
      context: {
        topic: topic.name,
        level,
      },
    };
  }
}
