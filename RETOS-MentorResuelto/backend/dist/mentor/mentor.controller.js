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
exports.MentorController = void 0;
const common_1 = require("@nestjs/common");
const mentor_service_1 = require("./mentor.service");
let MentorController = class MentorController {
    mentorService;
    constructor(mentorService) {
        this.mentorService = mentorService;
    }
    sendMessage(body) {
        return this.mentorService.sendMessage(body);
    }
};
exports.MentorController = MentorController;
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MentorController.prototype, "sendMessage", null);
exports.MentorController = MentorController = __decorate([
    (0, common_1.Controller)('mentor'),
    __metadata("design:paramtypes", [mentor_service_1.MentorService])
], MentorController);
//# sourceMappingURL=mentor.controller.js.map