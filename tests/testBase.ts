import { glue, glueBase } from "../src/glue/glue";

import * as program from "commander";

import { IBootService, tContracts, ILocalLogService } from "../src/model/contract/ServiceContracts";

class testBase extends glueBase{    
    public resolve<T>(service:symbol)  : T{
        return this.glue.container.get<T>(service);
    }   
}
export {testBase};