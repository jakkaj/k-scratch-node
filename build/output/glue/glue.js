"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const ServiceContracts_1 = require("../model/contract/ServiceContracts");
const bootService_1 = require("../model/service/bootService");
const configService_1 = require("../model/service/configService");
const localLogService_1 = require("../model/service/localLogService");
const kuduLogService_1 = require("../model/service/kuduLogService");
const kuduFileService_1 = require("../model/service/kuduFileService");
class glue {
    constructor() {
        this.container = new inversify_1.Container();
        this.container.bind(ServiceContracts_1.tContracts.IBootService).to(bootService_1.bootService).inSingletonScope();
        this.container.bind(ServiceContracts_1.tContracts.IConfigService).to(configService_1.configService).inSingletonScope();
        this.container.bind(ServiceContracts_1.tContracts.ILocalLogService).to(localLogService_1.localLogService).inSingletonScope();
        this.container.bind(ServiceContracts_1.tContracts.IKuduLogService).to(kuduLogService_1.kuduLogService).inSingletonScope();
        this.container.bind(ServiceContracts_1.tContracts.IKuduFileService).to(kuduFileService_1.kuduFileService).inSingletonScope();
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