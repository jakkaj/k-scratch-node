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
const fs = require("fs");
const tmp = require("tmp");
const path = require("path");
const del = require("del");
const unzip = require("unzip-stream");
const admzip = require("adm-zip");
const watch = require("watch");
const kuduApi = require("kudu-api");
const serviceBase_1 = require("./serviceBase");
const stringHelpers_1 = require("../helpers/stringHelpers");
const functionWalk_1 = require("../helpers/functionWalk");
let kuduFileService = class kuduFileService extends serviceBase_1.configBase {
    constructor() {
        super();
        this._stringHelper = new stringHelpers_1.stringHelpers();
    }
    monitor() {
        var dir = process.cwd();
        watch.createMonitor(dir, (monitor) => {
            //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
            monitor.on("created", (f, stat) => {
                // Handle new files
                this.logger.logInfo(`[CREATED] ${f}`);
                var subPath = f.replace(dir, '');
                this.uploadFile(f, subPath);
            });
            monitor.on("changed", (f, curr, prev) => {
                // Handle file changes
                this.logger.logInfo(`[CHANGED] ${f}`);
                var subPath = f.replace(dir, '');
                this.uploadFile(f, subPath);
            });
            monitor.on("removed", (f, stat) => {
                // Handle removed files
            });
        });
    }
    uploadFile(file, subPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            return new Promise((good, bad) => __awaiter(this, void 0, void 0, function* () {
                if (!fs.existsSync(file)) {
                    this.logger.logWarning(`Upload failed -> file not found ${file}`);
                    bad(`Upload failed`);
                }
                if (file.toLowerCase().indexOf("publishsettings") != -1) {
                    this.logger.logWarning(`Upload failed -> will not upload publish settings ${file}`);
                    bad(`Upload failed`);
                }
                try {
                    var result = yield this._doUpload(file, false, subPath);
                }
                catch (e) {
                    this.logger.logError("There was a problem uploading");
                }
            }));
        });
    }
    uploadFiles(subPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            return new Promise((good, bad) => __awaiter(this, void 0, void 0, function* () {
                var tmpFile = tmp.fileSync();
                var dir = process.cwd();
                var offset = ".";
                if (subPath != null && subPath.length > 0) {
                    dir = path.join(dir, subPath);
                    offset += subPath;
                }
                if (!fs.existsSync(dir)) {
                    yield del(tmpFile.name, { force: true });
                    this.logger.logWarning(`Directory could not be found: ${dir}`);
                    return false;
                }
                var output = fs.createWriteStream(tmpFile.name);
                var zip = new admzip();
                var w = new functionWalk_1.functionWalker(dir);
                var files = yield w.doWalk();
                this.logger.log("[Zipping]");
                for (var i in files) {
                    var f = files[i];
                    if (f.offsetName.toLowerCase().indexOf("publishsettings") != -1) {
                        continue;
                    }
                    zip.addFile(f.offsetName, fs.readFileSync(f.fullName));
                }
                zip.writeZip(tmpFile.name);
                try {
                    var result = yield this._doUpload(tmpFile.name, true, subPath);
                    yield del(tmpFile.name, { force: true });
                }
                catch (e) {
                    this.logger.logError("There was a problem uploading");
                }
            }));
        });
    }
    _doUpload(file, zip, subPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((good, bad) => {
                if (!fs.existsSync(file)) {
                    this.logger.logWarning(`Upload failed -> file not found ${file}`);
                    bad();
                    return;
                }
                var len = fs.statSync(file).size;
                var uPath = 'site/wwwroot/';
                if (subPath != null && subPath.length > 0) {
                    subPath = this._stringHelper.trim(subPath, '\\\\/');
                    uPath += subPath.replace('\\', '/');
                }
                this.logger.log(`[Uploading ${len} bytes to ${uPath}]`);
                var kudu = kuduApi({
                    website: this.publishProfile.msdeploySite,
                    username: this.publishProfile.userName,
                    password: this.publishProfile.userPWD
                });
                if (zip) {
                    kudu.zip.upload(file, uPath, (e) => {
                        if (e) {
                            this.logger.logError(`[Upload Zip Error] -> ${e}`);
                            bad(false);
                            return;
                        }
                        else {
                            this.logger.logGood("[Upload OK]");
                            good(true);
                        }
                    });
                }
                else {
                    kudu.vfs.uploadFile(file, uPath, (e) => {
                        if (e) {
                            this.logger.logError(`[Upload File Error] -> ${e}`);
                            bad(false);
                            return;
                        }
                        else {
                            this.logger.logGood("[Upload OK]");
                            good(true);
                        }
                    });
                }
            });
        });
    }
    getFiles(subPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            return new Promise((good, bad) => {
                var tmpFile = tmp.fileSync();
                var kudu = kuduApi({
                    website: this.publishProfile.msdeploySite,
                    username: this.publishProfile.userName,
                    password: this.publishProfile.userPWD
                });
                var requestUri = "https://" + this.publishProfile.publishUrl + "/api/zip/site/wwwroot/";
                var dlUri = 'site/wwwroot/';
                if (subPath != null && subPath.length > 0) {
                    subPath = this._stringHelper.trim(subPath, '\\\\/');
                    requestUri += subPath + "/";
                    dlUri += subPath + "/";
                }
                this.logger.log(`[Downloading] -> ${requestUri}`);
                kudu.zip.download(dlUri, tmpFile.name, (e) => __awaiter(this, void 0, void 0, function* () {
                    if (e) {
                        this.logger.logError(`[Download Error] -> ${e}`);
                        bad(false);
                        return;
                    }
                    else {
                        this.logger.logInfo("Downloaded to temp file: " + tmpFile.name);
                        fs.createReadStream(tmpFile.name).pipe(unzip.Extract({ path: "./" }));
                        yield del(tmpFile.name, { force: true });
                        good(true);
                    }
                }));
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