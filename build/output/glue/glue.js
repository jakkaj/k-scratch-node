"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const ServiceContracts_1 = require("../model/contract/ServiceContracts");
const bootService_1 = require("../model/service/bootService");
class glue {
    constructor() {
        this.container = new inversify_1.Container();
        this.container.bind(ServiceContracts_1.tContracts.IBootService).to(bootService_1.bootService);
        // this.container.bind<someOtherService>("aa").to(someOtherService);
    }
}
exports.glue = glue;
class glueBase {
    get glue() {
        return this._glue;
    }
    constructor() {
        this._glue = new glue();
    }
}
exports.glueBase = glueBase;
//# sourceMappingURL=glue.js.map