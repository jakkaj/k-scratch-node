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
require('dotenv').config();
const serviceBase_1 = require("./serviceBase");
let kuduLogService = class kuduLogService extends serviceBase_1.configBase {
    constructor() {
        super();
        this._publishProfile = null;
        this._ignoreSystemLogs = true;
        this.lineCache = [];
        this.lineIgnores = [
            "Executed HTTP request: {",
            "Executing HTTP request: {",
            "Response details: {",
            "Host Status: {"
        ];
        if (process.env.HIDE_SYSTEM_LOGS != undefined) {
            this._ignoreSystemLogs = process.env.HIDE_SYSTEM_LOGS;
        }
    }
    init() {
        if (this._publishProfile != null) {
            return;
        }
        var p = this.getDefaultConfig();
        this._publishProfile = p;
    }
    ignoreLine(line) {
        var ignore = false;
        while (this.lineCache.length > 30) {
            this.lineCache.splice(0, 1);
        }
        this.lineCache.forEach((c, i, a) => {
            if (c === line) {
                ignore = true;
            }
        });
        this.lineCache.push(line);
        if (!this._ignoreSystemLogs) {
            return false;
        }
        this.lineIgnores.forEach((c, i, a) => {
            if (line.indexOf(c) != -1) {
                ignore = true;
            }
        });
        var year = new Date().getFullYear();
        //Logs that do not have a time code are part of status dumps and we don't want to see them
        if (!line.startsWith(year.toString())) {
            ignore = true;
        }
        return ignore;
    }
    startLog() {
        this.init();
        var user = this._publishProfile.userName;
        var pass = this._publishProfile.userPWD;
        var url = this._publishProfile.publishUrl;
        var fullUrl = "https://" + url + "/logstream/application";
        var logReq = request.get(fullUrl).auth(user, pass, false);
        this.logger.log("- Attempting attach to the log stream");
        logReq.on('data', (chunk) => {
            var c = chunk.toString('utf8').trim();
            if (!c || (c && c.length == 0)) {
                return;
            }
            if (this.ignoreLine(c)) {
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