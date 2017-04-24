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
const fs = require("fs");
const afs = require("async-file");
const path = require("path");
const xml2js = require("xml2js");
const inversify_1 = require("inversify");
const serviceBase_1 = require("./serviceBase");
let configService = class configService extends serviceBase_1.serviceBase {
    constructor() {
        super();
        this._basePath = null;
    }
    init(basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._basePath = basePath;
            if (!this._validatePath(this._basePath)) {
                return false;
            }
            var configFile = yield this._findConfigFile(this._basePath);
            var config = yield this._getPublishFile(configFile);
            return true;
        });
    }
    _validatePath(p) {
        var pathExists = fs.existsSync(p);
        return pathExists;
    }
    _findConfigFile(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._validatePath(cwd)) {
                    return null;
                }
                var files = yield afs.readdir(cwd);
                if (files && files.length > 0) {
                    for (var fNumber in files) {
                        var f = files[fNumber];
                        if (f.toLowerCase().indexOf('publishsettings') != -1) {
                            return path.join(cwd, f);
                        }
                    }
                }
                //find parent path
                var parent = path.join(cwd, "..");
                return yield this._findConfigFile(parent);
            }
            catch (e) {
                this.logger.logException(e);
            }
            return null;
        });
    }
    _getPublishFile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield afs.exists(fileName))) {
                this.logger.logError("Publish file could not be found/opened: " + fileName);
                return null;
            }
            var file = yield afs.readFile(fileName, 'utf8');
            if (!file || file.length == 0) {
                this.logger.logError("Publish file opened by is empty: " + fileName);
                return null;
            }
            var p = new Promise((good, bad) => {
                xml2js.parseString(file, (err, result) => {
                    if (err)
                        bad(err);
                    else
                        good(result);
                });
            });
            return p;
        });
    }
    get basePath() {
        return this._basePath;
    }
};
configService = __decorate([
    inversify_1.injectable()
], configService);
exports.configService = configService;
//# sourceMappingURL=configService.js.map