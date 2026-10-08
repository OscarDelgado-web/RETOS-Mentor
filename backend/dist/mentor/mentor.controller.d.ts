import { MentorService } from './mentor.service';
import type { SendMentorMessageDto } from './mentor.service';
export declare class MentorController {
    private readonly mentorService;
    constructor(mentorService: MentorService);
    sendMessage(body: SendMentorMessageDto): Promise<{
        answer: string;
        context: {
            topic: string;
            level: import("@prisma/client").$Enums.ProgressLevel;
        };
    }>;
}
