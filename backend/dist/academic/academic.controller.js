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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicController = void 0;
const common_1 = require("@nestjs/common");
const academic_service_1 = require("./academic.service");
let AcademicController = class AcademicController {
    academicService;
    constructor(academicService) {
        this.academicService = academicService;
    }
    getCareers() {
        return this.academicService.findAllCareers();
    }
    getSubjects(careerId) {
        return this.academicService.findSubjectsByCareer(careerId);
    }
    getTopics(subjectId) {
        return this.academicService.findTopicsBySubject(subjectId);
    }
};
exports.AcademicController = AcademicController;
__decorate([
    (0, common_1.Get)('careers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getCareers", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __param(0, (0, common_1.Query)('careerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('topics'),
    __param(0, (0, common_1.Query)('subjectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getTopics", null);
exports.AcademicController = AcademicController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [academic_service_1.AcademicService])
], AcademicController);
//# sourceMappingURL=academic.controller.js.map