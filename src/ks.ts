#!/usr/bin/env node

import { glue, glueBase } from "./glue/glue";

import * as program from "commander";

import { IBootService, tContracts, ILocalLogService } from "./model/contract/ServiceContracts";

class init extends glueBase{
    async start(argv) : Promise<boolean>{    
       var booter = this.glue.container.get<IBootService>(tContracts.IBootService);  
       try{
            var success = await booter.booted(argv);    
            return success;
       }catch(e){
           throw e;
       }
    }
}

var i = new init();
var logger = i.glue.container.get<ILocalLogService>(tContracts.ILocalLogService);
i.start(process.argv).then((e)=>{
    if(e){
        logger.logGood("OK");  
    }else{
        logger.logError("NOT OK");  
        process.exit(1);
    }
    
}).catch((e)=>{

    logger.logError(e);
    console.error("NOT OK - EXCEPTION");
    process.exit(1);
});


    