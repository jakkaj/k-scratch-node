import { injectable, inject } from 'inversify';
import * as request from "request";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as del from "del";
import * as unzip from "unzip-stream";

import { IKuduFileService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";
import { serviceBase, configBase } from "./serviceBase";
import {stringHelpers} from "../helpers/stringHelpers";

@injectable()
class kuduFileService extends configBase implements IKuduFileService {
    
    private _stringHelper:stringHelpers;
    

    constructor(){
        super();

        this._stringHelper = new stringHelpers();

       
    }

    async getFiles(subPath: string):Promise<boolean>{
        this.init();

        return new Promise<boolean>((good, bad)=>{
            var tmpObj = tmp.dirSync();           

            var fTemp = path.join(tmpObj.name, "download.zip");

            var requestUri = "https://" + this.publishProfile.publishUrl + "/api/zip/site/wwwroot/";

            if (subPath != null && subPath.length > 0)
            {
                subPath = this._stringHelper.trim(subPath, '\\\\/');
                requestUri += subPath + "/";
            }

            var req = request.get(requestUri).auth(this.publishProfile.userName, this.publishProfile.userPWD, false);        
            
            req.on('response', (res)=>{
                res.pipe(fs.createWriteStream(fTemp));
            });

             req.on('error', (e)=>{
                this.logger.logError("[HTTPS] " + e);
                //tmpObj.removeCallback();
                bad(e);
             })

            req.on('end', async ()=>{
                this.logger.logInfo("Downloaded to temp file: " + tmpObj.name); 
                fs.createReadStream(fTemp).pipe(unzip.Extract({path: "./"}));
                await this.cleanUp(tmpObj);
                good(true);               
            });

           
            return null;
        });

      
    } 

    async cleanUp(tmpObj){
        await del(path.join(tmpObj.name, "**"), {force:true});
    }
}

export {kuduFileService};