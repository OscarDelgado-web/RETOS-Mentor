import { PrismaService } from '../prisma/prisma.service';
export declare class AcademicService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllCareers(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
    }[]>;
    findSubjectsByCareer(careerId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        careerId: number;
    }[]>;
    findTopicsBySubject(subjectId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        subjectId: number;
    }[]>;
}
