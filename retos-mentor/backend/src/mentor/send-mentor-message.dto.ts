import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { IsOptional, IsString, validateSync } from 'class-validator';

export class SendMentorMessageDto {
  studentId!: number;
  subjectId!: number;
  topicId!: number;
  sessionId?: number;
  @IsOptional()
  @IsString()
  modelId?: string;
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
        throw new BadRequestException(field + ' must be a positive integer');
      }
    }
    if (body.sessionId !== undefined && body.sessionId !== null) {
      if (typeof body.sessionId === 'string' && body.sessionId.startsWith('session-')) {
        delete body.sessionId;
      } else {
        const parsed = Number(body.sessionId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          throw new BadRequestException('sessionId must be a positive integer');
        }
        body.sessionId = parsed;
      }
    }
    if (typeof body.message !== 'string' || !body.message.trim()) {
      throw new BadRequestException('message must be a non-empty string');
    }
    if (body.message.trim().length > 2000) {
      throw new BadRequestException('message must not exceed 2000 characters');
    }

    const dto = Object.assign(new SendMentorMessageDto(), body) as SendMentorMessageDto;
    const validationErrors = validateSync(dto);
    if (validationErrors.length > 0) {
      const messages = validationErrors.flatMap((error) => Object.values(error.constraints ?? {}));
      throw new BadRequestException(messages);
    }
    return dto;
  }
}
