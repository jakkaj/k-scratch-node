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
const admzip = require("adm-zip");
const watch = require("watch");
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
                    if (f.toLowerCase().indexOf("publishsettings") != -1) {
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
                var requestUri = "";
                if (zip) {
                    requestUri = `https://${this.publishProfile.publishUrl}/api/zip/site/wwwroot/`;
                }
                else {
                    requestUri = `https://${this.publishProfile.publishUrl}/api/vfs/site/wwwroot/`;
                }
                if (subPath != null && subPath.length > 0) {
                    subPath = this._stringHelper.trim(subPath, '\\\\/');
                    requestUri += subPath;
                }
                this.logger.log(`[Uploading ${len} bytes to ${requestUri}]`);
                var uploadConfig = {
                    url: requestUri,
                    //'proxy': 'http://127.0.0.1:8888', 
                    //'rejectUnauthorized': false, 
                    headers: {
                        "Content-Length": len
                    },
                    body: fs.readFileSync(file)
                };
                if (!zip) {
                    uploadConfig.headers["If-Match"] = "*";
                }
                var req = request.put(uploadConfig)
                    .auth(this.publishProfile.userName, this.publishProfile.userPWD, false);
                var t = "";
                req.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
                    t += data;
                }));
                req.on('response', (response) => __awaiter(this, void 0, void 0, function* () {
                    this.logger.logGood(`[Upload ${response.statusCode}]`);
                    if (response.statusCode > 299) {
                        this.logger.logWarning(`[Error ${response.statusMessage}]`);
                    }
                }));
                req.on('error', (error) => __awaiter(this, void 0, void 0, function* () {
                    this.logger.logWarning(`[Error ${error}]`);
                }));
                req.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    this.logger.logInfo(t);
                    good(true);
                }));
            });
        });
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
                this.logger.log(`[Downloading] -> ${requestUri}`);
                var req = request.get(requestUri).auth(this.publishProfile.userName, this.publishProfile.userPWD, false);
                req.on('response', (res) => {
                    res.pipe(fs.createWriteStream(fTemp));
                });
                req.on('error', (e) => __awaiter(this, void 0, void 0, function* () {
                    this.logger.logError("[HTTPS] " + e);
                    yield this.cleanUp(tmpObj);
                    bad(false);
                }));
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