#!/usr/bin/env node

import { glue, glueBase } from "./glue/glue";


import * as program from "commander";
import { IBootService, tContracts } from "./model/contract/ServiceContracts";

class init extends glueBase{
    async start(argv){    
       var booter = this.glue.container.get<IBootService>(tContracts.IBootService);  
       await booter.booted(argv);
    }
}

var i = new init();
i.start(process.argv);


    