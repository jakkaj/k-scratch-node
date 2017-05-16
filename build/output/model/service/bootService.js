"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const ServiceContracts_1 = require("../contract/ServiceContracts");
const program = require("commander");
const serviceBase_1 = require("./serviceBase");
let bootService = class bootService extends serviceBase_1.serviceBase {
    constructor(configService, kuduLogService, kuduFileService) {
        super();
        this._configService = configService;
        this._kuduLogService = kuduLogService;
        this._kuduFileService = kuduFileService;
    }
    booted(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            this.argv = argv;
            this._process(argv);
            var subFolder = null;
            var cwdPath = null;
            if (argv.length === 2) {
                this._help();
                return;
            }
            if (program.path) {
                cwdPath = program.path;
            }
            if (program.folder) {
                subFolder = program.folder;
            }
            var initGood = yield this._configService.init(cwdPath);
            if (!initGood) {
                return false;
            }
            if (program.get) {
                var getResult = yield this._kuduFileService.getFiles(subFolder);
            }
            if (program.upload) {
                var uploadResult = yield this._kuduFileService.uploadFiles(subFolder);
            }
            if (program.log) {
                this._kuduLogService.startLog();
            }
            return initGood;
        });
    }
    _help() {
        program.help();
    }
    _process(argv) {
        program
            .version("{$version}")
            .option('-l, --log', 'Output the Kudulog stream to the console')
            .option('-p, --path [functionPath]', 'The base path of your function (blank for current path)')
            .option('-g, --get', 'Download the Function app ready for editing locally. Works with the -f sub folder option')
            .option('-u, --upload', 'Upload a folder to the server. Works with the -f sub folder option')
            .option('-f, --folder [folder]', 'Sub folder to get or upload. If omitted it will get or send everything under wwwroot from Kudu')
            .parse(argv);
    }
};
bootService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(ServiceContracts_1.tContracts.IConfigService)),
    __param(1, inversify_1.inject(ServiceContracts_1.tContracts.IKuduLogService)),
    __param(2, inversify_1.inject(ServiceContracts_1.tContracts.IKuduFileService))
], bootService);
exports.bootService = bootService;
//# sourceMappingURL=bootService.js.map