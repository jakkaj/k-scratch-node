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
const serviceBase_1 = require("./serviceBase");
let functionTestService = class functionTestService extends serviceBase_1.configBase {
    constructor() {
        super();
    }
    getFunctionData(functionKey) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            try {
                this.funcSettings = yield this.getFunctionSettings();
                if (this.funcSettings == null) {
                    return false;
                }
                var count = 1;
                for (var iFunc in this.funcSettings) {
                    var func = this.funcSettings[iFunc];
                    if (!func.config || !func.config.bindings) {
                        continue;
                    }
                    for (var iBind in func.config.bindings) {
                        var binding = func.config.bindings[iBind];
                        if (binding.direction == "in" && binding.type.indexOf("Trigger") != -1) {
                            this.logger.logInfo(`   (${count}) ${func.name} [${binding.type}]`);
                        }
                    }
                    count++;
                }
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
    getFunctionSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((good, bad) => {
                var siteSettings = this.getDefaultConfig();
                var requestUri = `https://${siteSettings.publishUrl}/api/functions`;
                var req = request.get(requestUri).auth(siteSettings.userName, siteSettings.userPWD, false);
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
                        var funcSettings = JSON.parse(result);
                        good(funcSettings);
                    }
                    else {
                        bad("Could not get the func settings");
                    }
                });
            });
        });
    }
};
functionTestService = __decorate([
    inversify_1.injectable()
], functionTestService);
exports.functionTestService = functionTestService;
//# sourceMappingURL=functionTestService.js.map