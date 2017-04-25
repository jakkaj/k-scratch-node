"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const chalk = require("chalk");
let localLogService = class localLogService {
    constructor() {
        this._checkThings = {
            errors: ["error", "failed"],
            good: ["succeeded"],
            warning: ["warn"],
            information: ["function completed", "reloading", "function started"]
        };
        this._errorRegular = chalk.red;
        this._errorBold = chalk.red.bold;
        this._warnRegular = chalk.yellow;
        this._warnBold = chalk.yellow.bold;
        this._infoRegular = chalk.cyan;
        this._goodRegular = chalk.green;
    }
    log(output) {
        if (this._check(output, this._checkThings.errors)) {
            this.logError(output);
        }
        else if (this._check(output, this._checkThings.warning)) {
            this.logWarning(output);
        }
        else if (this._check(output, this._checkThings.good)) {
            this.logGood(output);
        }
        else if (this._check(output, this._checkThings.information)) {
            this.logInfo(output);
        }
        else {
            console.log(output);
        }
    }
    logException(output) {
        console.log(this._errorBold("[Exception] ", this._errorRegular(output)));
    }
    logError(output) {
        console.log(this._errorBold("[Error] ", this._errorRegular(output)));
    }
    logInfo(output) {
        console.log(this._infoRegular(output));
    }
    logWarning(output) {
        console.log(this._warnBold("[Warning] ", this._warnRegular(output)));
    }
    logGood(output) {
        console.log(this._goodRegular(output));
    }
    _check(output, checkThings) {
        var outputLower = output.toLowerCase();
        for (var i in checkThings) {
            var thing = checkThings[i];
            if (output.toLowerCase().indexOf(thing.toLowerCase()) != -1) {
                return true;
            }
        }
        return false;
    }
};
localLogService = __decorate([
    inversify_1.injectable()
], localLogService);
exports.localLogService = localLogService;
//# sourceMappingURL=localLogService.js.map