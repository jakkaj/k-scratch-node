import { injectable, inject } from 'inversify';
import * as request from "request";

import { IKuduLogService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";
import { serviceBase, configBase } from "./serviceBase";

@injectable()
class kuduLogService extends configBase implements IKuduLogService {

    private _publishProfile : publishProfile = null;

    init(){

        if(this._publishProfile != null)
        {
            return;
        }

        var p = this.getDefaultConfig();
        
         this._publishProfile = p;   
    }

    startLog(){
        this.init();
        var user = this._publishProfile.userName;
        var pass = this._publishProfile.userPWD;
        var url = this._publishProfile.publishUrl;

        var fullUrl = "https://" + url + "/logstream/application";

        var logReq = request.get(fullUrl).auth(user, pass, false);

        this.logger.log("- Attempting attach to the log stream")
                

        logReq.on('data', (chunk)=>{
           var c:string = chunk.toString('utf8').trim();
           
           if(!c || (c && c.length == 0)){
               return;
           }

           this.logger.log(c);
        })

        logReq.on('error', (e)=>{
            this.logger.logError("[HTTPS] " + e);
        })

        logReq.on('end', ()=>{
            this.logger.logWarning("STREAM ENDED");
        });
    }
}

export {kuduLogService};