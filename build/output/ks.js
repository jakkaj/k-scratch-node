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
            try {
                var success = yield booter.booted(argv);
                return success;
            }
            catch (e) {
                throw e;
            }
        });
    }
    runTest(funNumb) {
        return __awaiter(this, void 0, void 0, function* () {
            var runner = i.glue.container.get(ServiceContracts_1.tContracts.IFunctionTestService);
            if (!runner.canRunTest()) {
                return;
            }
            yield runner.runTest(funNumb);
        });
    }
}
var i = new init();
var logger = i.glue.container.get(ServiceContracts_1.tContracts.ILocalLogService);
i.start(process.argv).then((e) => {
    if (e) {
        logger.logGood("OK");
        process.stdin.resume();
        process.stdin.on('data', (k) => {
            var key = k.toString();
            if (!key.match(/[0-9]+/)) {
                logger.logWarning("Please enter the number of the remote Function to run");
                return;
            }
            try {
                var keyNumb = parseInt(key);
                i.runTest(keyNumb);
            }
            catch (e) {
            }
        });
    }
    else {
        logger.logError("NOT OK");
        process.exit(1);
    }
}).catch((e) => {
    logger.logError(e);
    console.error("NOT OK - EXCEPTION");
    process.exit(1);
});
//# sourceMappingURL=ks.js.map