import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMentorMessageDto } from './send-mentor-message.dto';
import { createLlmProvider } from './llm-provider';
import type { LlmHistoryMessage, LlmProvider } from './llm-provider';

@Injectable()
export class MentorService {
  private readonly logger = new Logger(MentorService.name);

  constructor(private prisma: PrismaService) {}

  async sendMessage(data: SendMentorMessageDto) {
    const { studentId, subjectId, topicId, sessionId, message } = data;
    const modelId = data.modelId?.trim() || undefined;
    const cleanMessage = message.trim();

    if (!cleanMessage) throw new BadRequestException('message must be a non-empty string');
    if (cleanMessage.length > 2000) throw new BadRequestException('message must not exceed 2000 characters');

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');
    if (student.careerId !== subject.careerId) {
      throw new BadRequestException('Subject does not belong to the student career');
    }

    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');
    if (topic.subjectId !== subjectId) {
      throw new BadRequestException('Topic does not belong to the specified subject');
    }

    const providerName = (process.env.LLM_PROVIDER ?? 'openai').toLowerCase();
    if (providerName === 'openai' && !process.env.LLM_API_KEY?.trim()) {
      throw new ServiceUnavailableException('LLM_API_KEY is required when LLM_PROVIDER=openai');
    }
    if (providerName === 'gemini' && !process.env.GEMINI_API_KEY?.trim() && !process.env.LLM_API_KEY?.trim()) {
      throw new ServiceUnavailableException('GEMINI_API_KEY is required when LLM_PROVIDER=gemini');
    }

    let provider: LlmProvider;
    try {
      provider = createLlmProvider(providerName);
    } catch {
      throw new ServiceUnavailableException('The configured LLM provider is not supported');
    }

    let session: { id: number } | null = null;
    if (sessionId !== undefined) {
      session = await this.prisma.mentorSession.findFirst({
        where: { id: sessionId, studentId },
        select: { id: true },
      });
      if (!session) throw new NotFoundException('Mentor session not found');
    }

    let history: LlmHistoryMessage[] = [];
    if (session) {
      const previousMessages = await this.prisma.mentorMessage.findMany({
        where: { sessionId: session.id, role: { in: ['USER', 'ASSISTANT'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { role: true, content: true },
      });
      history = previousMessages.reverse().map((entry) => ({
        role: entry.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: entry.content,
      }));
    }

    const resources = await this.prisma.academicResource.findMany({
      where: { topicId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, url: true },
    });
    const progress = await this.prisma.studentTopicProgress.findUnique({
      where: { studentId_topicId: { studentId, topicId } },
    });
    const level = progress?.level ?? 'NOT_EVALUATED';

    let answer: string;
    try {
      answer = await provider.generateAnswer({
        topic: topic.name,
        subject: subject.name,
        student: student.name,
        level,
        question: cleanMessage,
        modelId,
        history,
        sources: resources.map(({ title, description, url }) => ({ title, description, url })),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        const timeoutSeconds = providerName === 'gemini' ? 60 : 15;
        this.logger.warn(`LLM provider "${providerName}" timed out after ${timeoutSeconds} seconds`);
        throw new BadGatewayException(`The LLM provider timed out after ${timeoutSeconds} seconds`);
      }
      const safeDetail = error instanceof Error
        ? error.message.replace(/https?:\/\/\S+/g, '[provider URL]').slice(0, 200)
        : 'Unknown provider error';
      this.logger.error(`LLM provider "${providerName}" failed: ${safeDetail}`);
      throw new ServiceUnavailableException('The LLM provider is unavailable');
    }

    const activeSession = session ?? await this.prisma.mentorSession.create({
      data: { studentId },
      select: { id: true },
    });
    await this.prisma.mentorMessage.create({
      data: { sessionId: activeSession.id, role: 'USER', content: cleanMessage },
    });
    const assistantMessage = await this.prisma.mentorMessage.create({
      data: { sessionId: activeSession.id, role: 'ASSISTANT', content: answer },
    });

    return {
      answer: assistantMessage.content,
      sessionId: activeSession.id,
      context: { topic: topic.name, level },
      sources: resources,
    };
  }
}
