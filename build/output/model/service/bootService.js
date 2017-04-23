"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
require("reflect-metadata");
const program = require("commander");
let bootService = class bootService {
    booted(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            this.argv = argv;
            this._process(argv);
            if (argv.length === 2) {
                this._help();
                return;
            }
            if (program.log) {
                console.log("You logged!");
            }
        });
    }
    _help() {
        program.help();
    }
    _process(argv) {
        program
            .version("{$version}")
            .option('-l, --log', 'Output the Kudulog stream to the console')
            .parse(argv);
    }
};
bootService = __decorate([
    inversify_1.injectable()
], bootService);
exports.bootService = bootService;
//# sourceMappingURL=bootService.js.map