import "reflect-metadata";
import { Container } from "inversify"

import {IBootService, tContracts} from "../model/contract/ServiceContracts";
import {bootService} from "../model/service/bootService";

class glue{
    public container:Container;

    constructor(){
        this.container = new Container();

         this.container.bind<IBootService>(tContracts.IBootService).to(bootService);
        // this.container.bind<someOtherService>("aa").to(someOtherService);
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