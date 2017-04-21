#!/usr/bin/env node

import { glue } from "./glue/glue";

import  * as program from "commander";

program
    .version("{$version}")
    .option('-l, --log', 'Output the Kudulog stream to the console')
    .parse(process.argv);

    