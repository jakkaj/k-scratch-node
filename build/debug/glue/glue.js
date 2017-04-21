"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
class glue {
    constructor() {
        this.container = new inversify_1.Container();
        // this.container.bind<ISampleInterface>(types.ISampleInterface).to(someService);
        // this.container.bind<someOtherService>("aa").to(someOtherService);
    }
}
exports.glue = glue;
//# sourceMappingURL=glue.js.map