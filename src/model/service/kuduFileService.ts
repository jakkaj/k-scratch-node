import { injectable, inject } from 'inversify';
import * as request from "request";
import * as fs from "fs";

import { IKuduFileService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";
import { serviceBase, configBase } from "./serviceBase";

@injectable()
class kuduFileService extends configBase implements IKuduFileService {
    
    async getFiles(subPath: string):Promise<boolean>{
        var tmp = require('tmp'); 
        var tmpobj = tmp.fileSync();
        console.log("File: ", tmpobj.name);
        console.log("Filedescriptor: ", tmpobj.fd);
  
        // If we don't need the file anymore we could manually call the removeCallback 
        // But that is not necessary if we didn't pass the keep option because the library 
        // will clean after itself. 
        tmpobj.removeCallback();


        return null;
    } 
}

export {kuduFileService};