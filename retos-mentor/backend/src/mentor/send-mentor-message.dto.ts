import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export class SendMentorMessageDto {
  studentId!: number;
  subjectId!: number;
  topicId!: number;
  message!: string;
}

@Injectable()
export class SendMentorMessageValidationPipe implements PipeTransform<unknown, SendMentorMessageDto> {
  transform(value: unknown): SendMentorMessageDto {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Request body must be an object');
    }

    const body = value as Record<string, unknown>;
    for (const field of ['studentId', 'subjectId', 'topicId'] as const) {
      if (!Number.isInteger(body[field]) || Number(body[field]) <= 0) {
        throw new BadRequestException(`${field} must be a positive integer`);
      }
    }
    if (typeof body.message !== 'string' || !body.message.trim()) {
      throw new BadRequestException('message must be a non-empty string');
    }

    return Object.assign(new SendMentorMessageDto(), body) as SendMentorMessageDto;
  }
}
