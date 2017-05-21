import { injectable, inject } from 'inversify';
import * as request from "request";
require('dotenv').config();
import { IKuduLogService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";
import { serviceBase, configBase } from "./serviceBase";

@injectable()
class kuduLogService extends configBase implements IKuduLogService {

    private _publishProfile : publishProfile = null;
    private _ignoreSystemLogs: boolean = true;

    private lineCache = [];   

    private lineIgnores=[
        "Executed HTTP request: {",
        "Executing HTTP request: {",
        "Response details: {", 
        "Host Status: {"
    ];        
    
    constructor() {
        super();
        
        if(process.env.HIDE_SYSTEM_LOGS != undefined){
            this._ignoreSystemLogs = process.env.HIDE_SYSTEM_LOGS;
        }
    }

    init(){

        if(this._publishProfile != null)
        {
            return;
        }

        var p = this.getDefaultConfig();
        
         this._publishProfile = p;   
    }

    private ignoreLine(line:string):boolean{
        
        var ignore:boolean = false;
        

        while(this.lineCache.length > 30){
            this.lineCache.splice(0, 1);
        }        

        this.lineCache.forEach((c,i,a)=>{
            if(c === line){
                ignore=true;
            }
        });

        this.lineCache.push(line);

        if(!this._ignoreSystemLogs){
            return false;
        }

        this.lineIgnores.forEach((c, i, a)=>{
            if(line.indexOf(c)!=-1){
                ignore = true;
            }
        });

        var year = new Date().getFullYear();            
        //Logs that do not have a time code are part of status dumps and we don't want to see them
        if(!line.startsWith(year.toString())){
            ignore = true;
        }       

        return ignore;
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

           if(this.ignoreLine(c)){
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