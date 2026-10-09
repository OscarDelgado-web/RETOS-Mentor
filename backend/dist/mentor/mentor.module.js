"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorModule = void 0;
const common_1 = require("@nestjs/common");
const mentor_controller_1 = require("./mentor.controller");
const mentor_service_1 = require("./mentor.service");
let MentorModule = class MentorModule {
};
exports.MentorModule = MentorModule;
exports.MentorModule = MentorModule = __decorate([
    (0, common_1.Module)({
        controllers: [mentor_controller_1.MentorController],
        providers: [mentor_service_1.MentorService]
    })
], MentorModule);
//# sourceMappingURL=mentor.module.js.map