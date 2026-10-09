import { Body, Controller, Post } from '@nestjs/common';
import { MentorService } from './mentor.service';
import type { SendMentorMessageDto } from './mentor.service';

@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post('messages')
  sendMessage(@Body() body: SendMentorMessageDto) {
    return this.mentorService.sendMessage(body);
  }
}
