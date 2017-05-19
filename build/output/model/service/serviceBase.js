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
const request = require("request");
const ServiceContracts_1 = require("../contract/ServiceContracts");
const publishSettings_1 = require("../entity/publishSettings");
let serviceBase = class serviceBase {
};
__decorate([
    inversify_1.inject(ServiceContracts_1.tContracts.ILocalLogService)
], serviceBase.prototype, "logger", void 0);
serviceBase = __decorate([
    inversify_1.injectable()
], serviceBase);
exports.serviceBase = serviceBase;
let configBase = class configBase extends serviceBase {
    constructor() {
        super(...arguments);
        this.publishProfile = null;
    }
    init() {
        if (this.publishProfile == null) {
            this.publishProfile = this.getDefaultConfig();
        }
    }
    getDefaultConfig() {
        var p = this.configService.getPublishProfile(publishSettings_1.publishMethods.msDeploy);
        if (p == null) {
            this.logger.logError('Publish method was not found ' + publishSettings_1.publishMethods.msDeploy);
            throw 'Publish method was not found ' + publishSettings_1.publishMethods.msDeploy;
        }
        return p;
    }
    //TODO: These get methods should really be on an injected class, for now they are here. 
    getAndParse(requestUri, config) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = yield this.get(requestUri, config);
            if (!result || result.length == 0) {
                return null;
            }
            var obj = JSON.parse(result);
            return obj;
        });
    }
    get(requestUri, config) {
        return __awaiter(this, void 0, void 0, function* () {
            var siteSettings = this.getDefaultConfig();
            if (!config) {
                config = {};
            }
            return new Promise((good, bad) => {
                var req = request.get(requestUri, config).auth(siteSettings.userName, siteSettings.userPWD, false);
                var result = "";
                var isGood = false;
                req.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
                    result += data;
                }));
                req.on('response', (response) => __awaiter(this, void 0, void 0, function* () {
                    if (response.statusCode > 299) {
                        this.logger.logWarning(`[Error ${response.statusMessage}]`);
                    }
                    else {
                        isGood = true;
                    }
                }));
                req.on('end', () => {
                    if (isGood) {
                        good(result);
                    }
                    else {
                        bad("Could not get the func settings");
                    }
                });
            });
        });
    }
};
__decorate([
    inversify_1.inject(ServiceContracts_1.tContracts.IConfigService)
], configBase.prototype, "configService", void 0);
configBase = __decorate([
    inversify_1.injectable()
], configBase);
exports.configBase = configBase;
//# sourceMappingURL=serviceBase.js.map