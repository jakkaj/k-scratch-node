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
const fs = require("fs");
const tmp = require("tmp");
const path = require("path");
const del = require("del");
const unzip = require("unzip-stream");
const serviceBase_1 = require("./serviceBase");
const stringHelpers_1 = require("../helpers/stringHelpers");
let kuduFileService = class kuduFileService extends serviceBase_1.configBase {
    constructor() {
        super();
        this._stringHelper = new stringHelpers_1.stringHelpers();
    }
    getFiles(subPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            return new Promise((good, bad) => {
                var tmpObj = tmp.dirSync();
                var fTemp = path.join(tmpObj.name, "download.zip");
                var requestUri = "https://" + this.publishProfile.publishUrl + "/api/zip/site/wwwroot/";
                if (subPath != null && subPath.length > 0) {
                    subPath = this._stringHelper.trim(subPath, '\\\\/');
                    requestUri += subPath + "/";
                }
                var req = request.get(requestUri).auth(this.publishProfile.userName, this.publishProfile.userPWD, false);
                req.on('response', (res) => {
                    res.pipe(fs.createWriteStream(fTemp));
                });
                req.on('error', (e) => {
                    this.logger.logError("[HTTPS] " + e);
                    //tmpObj.removeCallback();
                    bad(e);
                });
                req.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    this.logger.logInfo("Downloaded to temp file: " + tmpObj.name);
                    fs.createReadStream(fTemp).pipe(unzip.Extract({ path: "./" }));
                    yield this.cleanUp(tmpObj);
                    good(true);
                }));
                return null;
            });
        });
    }
    cleanUp(tmpObj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield del(path.join(tmpObj.name, "**"), { force: true });
        });
    }
};
kuduFileService = __decorate([
    inversify_1.injectable()
], kuduFileService);
exports.kuduFileService = kuduFileService;
//# sourceMappingURL=kuduFileService.js.map