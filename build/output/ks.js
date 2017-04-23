#!/usr/bin/env node
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
const glue_1 = require("./glue/glue");
const ServiceContracts_1 = require("./model/contract/ServiceContracts");
class init extends glue_1.glueBase {
    start(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            var booter = this.glue.container.get(ServiceContracts_1.tContracts.IBootService);
            yield booter.booted(argv);
        });
    }
}
var i = new init();
i.start(process.argv);
//# sourceMappingURL=ks.js.map