import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMentorMessageDto } from './send-mentor-message.dto';
import { createLlmProvider } from './llm-provider';
import type { LlmProvider } from './llm-provider';

@Injectable()
export class MentorService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(data: SendMentorMessageDto) {
    const { studentId, subjectId, topicId, message } = data;

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

    const resources = await this.prisma.academicResource.findMany({
      where: { topicId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, url: true },
    });
    const sources = resources;

    const progress = await this.prisma.studentTopicProgress.findUnique({
      where: {
        studentId_topicId: { studentId, topicId },
      },
    });

    const level = progress ? progress.level : 'NOT_EVALUATED';

    const session = await this.prisma.mentorSession.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }) ?? await this.prisma.mentorSession.create({
      data: { studentId },
      select: { id: true },
    });

    await this.prisma.mentorMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: message.trim(),
      },
    });

    let answer: string;
    const providerName = process.env.LLM_PROVIDER ?? 'openai';
    let provider: LlmProvider;
    try {
      provider = createLlmProvider(providerName);
    } catch {
      throw new BadGatewayException('The configured LLM provider is not supported');
    }
    if (providerName.toLowerCase() === 'mock' || providerName.toLowerCase() === 'ollama' || process.env.LLM_API_KEY) {
      try {
        answer = await provider.generateAnswer({
          topic: topic.name,
          subject: subject.name,
          student: student.name,
          level,
          question: message.trim(),
          sources: sources.map(({ title, description, url }) => ({ title, description, url })),
        });
      } catch {
        throw new BadGatewayException('The LLM provider is unavailable');
      }
    } else {
      answer = `Un ${topic.name} es un concepto clave. Sobre tu consulta "${message.trim()}": te lo explico según tu nivel ${level}.`;
    }

    const assistantMessage = await this.prisma.mentorMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: answer,
      },
    });

    return {
      answer: assistantMessage.content,
      context: {
        topic: topic.name,
        level,
      },
      sources,
    };
  }
}
