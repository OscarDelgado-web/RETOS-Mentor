import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findOne(id: number): Promise<{
        id: number;
        name: string;
        careerId: number;
    }>;
}
