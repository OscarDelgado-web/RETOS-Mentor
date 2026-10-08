"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MentorService = class MentorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(data) {
        const { studentId, subjectId, topicId, message } = data ?? {};
        if (![studentId, subjectId, topicId].every((id) => Number.isInteger(id) && id > 0) ||
            typeof message !== 'string' || !message.trim()) {
            throw new common_1.BadRequestException('studentId, subjectId, topicId and message are required');
        }
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject)
            throw new common_1.NotFoundException('Subject not found');
        const topic = await this.prisma.topic.findUnique({
            where: { id: topicId },
        });
        if (!topic) {
            throw new common_1.NotFoundException('Topic not found');
        }
        if (topic.subjectId !== subjectId) {
            throw new common_1.BadRequestException('Topic does not belong to the specified subject');
        }
        const progress = await this.prisma.studentTopicProgress.findUnique({
            where: {
                studentId_topicId: { studentId, topicId },
            },
        });
        const level = progress ? progress.level : 'NOT_EVALUATED';
        const answer = `Un ${topic.name} es un concepto clave. Sobre tu consulta "${message.trim()}": te lo explico según tu nivel ${level}.`;
        return {
            answer,
            context: {
                topic: topic.name,
                level,
            },
        };
    }
};
exports.MentorService = MentorService;
exports.MentorService = MentorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MentorService);
//# sourceMappingURL=mentor.service.js.map