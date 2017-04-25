"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const request = require("request");
const publishSettings_1 = require("../entity/publishSettings");
const serviceBase_1 = require("./serviceBase");
let kuduLogService = class kuduLogService extends serviceBase_1.configBase {
    constructor() {
        super(...arguments);
        this._publishProfile = null;
    }
    init() {
        if (this._publishProfile != null) {
            return;
        }
        var p = this.configService.getPublishProfile(publishSettings_1.publishMethods.msDeploy);
        if (p == null) {
            this.logger.logError('Publish method was not found ' + publishSettings_1.publishMethods.msDeploy);
            throw 'Publish method was not found ' + publishSettings_1.publishMethods.msDeploy;
        }
        this._publishProfile = p;
    }
    startLog() {
        this.init();
        var user = this._publishProfile.userName;
        var pass = this._publishProfile.userPWD;
        var url = this._publishProfile.publishUrl;
        var fullUrl = "https://" + url + "/logstream/application";
        var logReq = request.get(fullUrl).auth(user, pass, false);
        logReq.on('data', (chunk) => {
            var c = chunk.toString('utf8').trim();
            if (!c || (c && c.length == 0)) {
                return;
            }
            this.logger.log(c);
        });
        logReq.on('error', (e) => {
            this.logger.logError("[HTTPS] " + e);
        });
        logReq.on('end', () => {
            this.logger.logWarning("STREAM ENDED");
        });
    }
};
kuduLogService = __decorate([
    inversify_1.injectable()
], kuduLogService);
exports.kuduLogService = kuduLogService;
//# sourceMappingURL=kuduLogService.js.map