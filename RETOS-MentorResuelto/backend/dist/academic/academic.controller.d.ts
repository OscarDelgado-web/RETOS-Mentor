import { AcademicService } from './academic.service';
export declare class AcademicController {
    private readonly academicService;
    constructor(academicService: AcademicService);
    getCareers(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
    }[]>;
    getSubjects(careerId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        careerId: number;
    }[]>;
    getTopics(subjectId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        subjectId: number;
    }[]>;
}
