import "reflect-metadata";
import { Container } from "inversify"

import { IBootService, tContracts, IConfigService, ILocalLogService,
     IKuduLogService, IKuduFileService, IFunctionGraphService, 
     IFunctionTestService } from "../model/contract/ServiceContracts";
     
import { bootService } from "../model/service/bootService";
import { configService } from "../model/service/configService";
import { localLogService } from "../model/service/localLogService";
import { kuduLogService } from "../model/service/kuduLogService";
import { serviceBase } from "../model/service/serviceBase";
import { kuduFileService } from "../model/service/kuduFileService";
import { functionGraphService } from "../model/service/functionGraphSevice";
import { functionTestService } from "../model/service/functionTestService";

class glue{
    public container:Container;

    constructor(){
        this.container = new Container();

        this.container.bind<IBootService>(tContracts.IBootService).to(bootService).inSingletonScope();
        this.container.bind<IConfigService>(tContracts.IConfigService).to(configService).inSingletonScope();
        this.container.bind<ILocalLogService>(tContracts.ILocalLogService).to(localLogService).inSingletonScope();
        this.container.bind<IKuduLogService>(tContracts.IKuduLogService).to(kuduLogService).inSingletonScope();
        this.container.bind<IKuduFileService>(tContracts.IKuduFileService).to(kuduFileService).inSingletonScope();
        this.container.bind<IFunctionGraphService>(tContracts.IFunctionGraphService).to(functionGraphService).inSingletonScope();
        this.container.bind<IFunctionTestService>(tContracts.IFunctionTestService).to(functionTestService).inSingletonScope();
    }    
}

class glueBase{
    private _glue : glue;
    
    get glue():glue{
        return this._glue;
    }
    constructor(){
        
        this._glue = new glue();
    }
}

export {glue, glueBase};