"use strict";
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
const configGrapher_1 = require("../configGrapher/configGrapher");
const serviceBase_1 = require("./serviceBase");
class functionGraphService extends serviceBase_1.configBase {
    constructor() {
        super();
    }
    buildGraph(saveFile) {
        return __awaiter(this, void 0, void 0, function* () {
            this._dir = process.cwd();
            this._grapher = new configGrapher_1.configGrapher(this._dir);
            this.logger.log(`[Graphing] ${this._dir}`);
            var result = yield this._grapher.walk();
            if (saveFile.indexOf('.svg') == -1) {
                saveFile += '.svg';
            }
            fs.writeFileSync(saveFile, result);
            this.logger.logGood(`[Graph saved] -> ${this._dir}`);
        });
    }
}
exports.functionGraphService = functionGraphService;
//# sourceMappingURL=functionGraphSevice.js.map