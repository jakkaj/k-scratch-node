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
const serviceBase_1 = require("./serviceBase");
let functionTestService = class functionTestService extends serviceBase_1.configBase {
    constructor() {
        super();
        this.settingsMatch = [];
    }
    runTest(testNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((good, bad) => __awaiter(this, void 0, void 0, function* () {
                if (!this.settingsMatch) {
                    this.logger.logError("No settings found to run remote testing");
                    bad(false);
                }
                if (this.settingsMatch.length < testNumber) {
                    this.logger.logWarning("Setting number is out of range");
                    bad(false);
                }
                var setting = this.settingsMatch[testNumber - 1];
                var siteSettings = this.getDefaultConfig();
                if (setting[1].type == "httpTrigger") {
                    var confRaw = setting[0].test_data == "" ? "{}" : setting[0].test_data;
                    var conf = JSON.parse(confRaw);
                    var urlBase = `${siteSettings.destinationAppUrl}/api/${setting[0].name}?`;
                    if (conf.queryStringParams) {
                        for (var iQs in conf.queryStringParams) {
                            var qs = conf.queryStringParams[iQs];
                            urlBase += `${encodeURI(qs.name)}=${encodeURI(qs.value)}&`;
                        }
                    }
                    try {
                        var key = yield this.getKey(siteSettings, setting[0]);
                        urlBase += `code=${key}`;
                    }
                    catch (e) {
                        this.logger.log("There was a problem getting the function admin key");
                        bad(false);
                    }
                }
                else {
                }
            }));
        });
    }
    getKey(siteSettings, functionSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            var requestUri = `${siteSettings.destinationAppUrl.replace("http", "https")}/admin/functions/${functionSettings.name}/keys`;
            var headers = { 'x-functions-key': this.key };
            var result = yield this.get(requestUri, { headers: headers });
            return result;
        });
    }
    getFunctionData(functionKey) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            this.key = functionKey;
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
                            this.settingsMatch.push([func, binding]);
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
            return new Promise((good, bad) => __awaiter(this, void 0, void 0, function* () {
                var siteSettings = this.getDefaultConfig();
                var requestUri = `https://${siteSettings.publishUrl}/api/functions`;
                try {
                    var result = yield this.get(requestUri);
                    var funcSettings = JSON.parse(result);
                    good(funcSettings);
                }
                catch (e) {
                    bad(false);
                }
            }));
        });
    }
};
functionTestService = __decorate([
    inversify_1.injectable()
], functionTestService);
exports.functionTestService = functionTestService;
//# sourceMappingURL=functionTestService.js.map