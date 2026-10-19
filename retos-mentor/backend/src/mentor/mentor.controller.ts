import { Body, Controller, Post } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { SendMentorMessageDto, SendMentorMessageValidationPipe } from './send-mentor-message.dto';

@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post('messages')
  sendMessage(@Body(new SendMentorMessageValidationPipe()) body: SendMentorMessageDto) {
    return this.mentorService.sendMessage(body);
  }
}
