
import * as fs from 'fs';

import {configGrapher} from '../configGrapher/configGrapher';
import { configBase } from "./serviceBase";
import { IFunctionGraphService } from "../contract/ServiceContracts";

class functionGraphService extends configBase implements IFunctionGraphService{
    
    private _dir:string;
    private _grapher:configGrapher;
    constructor(){
        super();
        
        
    }

    async buildGraph(saveFile:string){
        this._dir = process.cwd();
        this._grapher = new configGrapher(this._dir);
        this.logger.log(`[Graphing] ${this._dir}`);
        var result = await this._grapher.walk();

        if(saveFile.indexOf('.svg') == -1){
            saveFile += '.svg';
        }

        fs.writeFileSync(saveFile, result);
        this.logger.logGood(`[Graph saved] -> ${this._dir}`);
    }
}

export {functionGraphService};