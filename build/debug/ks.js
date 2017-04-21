#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .version("{$version}")
    .option('-l, --log', 'Output the Kudulog stream to the console')
    .parse(process.argv);
//# sourceMappingURL=ks.js.map