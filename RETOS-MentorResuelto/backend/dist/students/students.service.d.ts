import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: number): Promise<{
        id: number;
        name: string;
        careerId: number;
    }>;
}
