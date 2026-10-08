import { PrismaService } from '../prisma/prisma.service';
export interface SendMentorMessageDto {
    studentId: number;
    subjectId: number;
    topicId: number;
    message: string;
}
export declare class MentorService {
    private prisma;
    constructor(prisma: PrismaService);
    sendMessage(data: SendMentorMessageDto): Promise<{
        answer: string;
        context: {
            topic: string;
            level: import("@prisma/client").$Enums.ProgressLevel;
        };
    }>;
}
