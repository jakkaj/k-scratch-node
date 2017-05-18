import { injectable, inject } from 'inversify';
import * as request from "request";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as del from "del";
import * as unzip from "unzip-stream";
import * as admzip from "adm-zip";
import * as watch from 'watch';

import { IKuduFileService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";
import { serviceBase, configBase } from "./serviceBase";
import {stringHelpers} from "../helpers/stringHelpers";
import {functionWalker} from "../helpers/functionWalk";

@injectable()
class kuduFileService extends configBase implements IKuduFileService {
    
    private _stringHelper:stringHelpers;    

    constructor(){
        super();

        this._stringHelper = new stringHelpers();       
    }    

    monitor(){
        var dir = process.cwd();
        watch.createMonitor(dir,  (monitor) => {
            //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
            monitor.on("created", (f, stat)=> {
            // Handle new files
                this.logger.logInfo(`[CREATED] ${f}`)
                var subPath = f.replace(dir, '');
                this.uploadFile(f, subPath);
            })
            monitor.on("changed", (f, curr, prev)=> {
            // Handle file changes
                this.logger.logInfo(`[CHANGED] ${f}`);
                var subPath = f.replace(dir, '');
                this.uploadFile(f, subPath); 
            })
            monitor.on("removed", (f, stat)=> {
            // Handle removed files
            })        
        });
    }

    async uploadFile(file:string, subPath:string):Promise<boolean>{
        this.init();

        return new Promise<boolean>(async (good, bad)=>{
            if(!fs.existsSync(file)){
                this.logger.logWarning(`Upload failed -> file not found ${file}`);
                bad(`Upload failed`)
            }

            if(file.toLowerCase().indexOf("publishsettings")!=-1){
                 this.logger.logWarning(`Upload failed -> will not upload publish settings ${file}`);
                 bad(`Upload failed`)
            }

            try{
                var result = await this._doUpload(file,false, subPath);                
            } catch(e){
                this.logger.logError("There was a problem uploading");
            }
        });
    }

    async uploadFiles(subPath:string):Promise<boolean>{
        this.init();

        return new Promise<boolean>(async (good, bad)=>{
            var tmpFile = tmp.fileSync();
            
            var dir = process.cwd();

            var offset = ".";

            if (subPath != null && subPath.length > 0)
            {
                dir = path.join(dir, subPath);
                offset += subPath;
            }

            if(!fs.existsSync(dir)){
                await del(tmpFile.name, {force:true});
                this.logger.logWarning(`Directory could not be found: ${dir}`);
                return false;
            }

            var output = fs.createWriteStream(tmpFile.name);

            var zip = new admzip();    
           
            var w = new functionWalker(dir);       
            var files = await w.doWalk();
            this.logger.log("[Zipping]");
            
            for(var i in files){
                var f = files[i];                
               zip.addFile(f.offsetName, fs.readFileSync(f.fullName));
            }

            zip.writeZip(tmpFile.name);            
           
            try{
                var result = await this._doUpload(tmpFile.name, true, subPath);
                await del(tmpFile.name, {force:true});
            } catch(e){
                this.logger.logError("There was a problem uploading");
            }
        
        });
    }

    private async _doUpload(file:string, zip:boolean, subPath:string):Promise<boolean>{
        return new Promise<boolean>((good, bad)=>{
            
            if(!fs.existsSync(file)){
                this.logger.logWarning(`Upload failed -> file not found ${file}`);
                bad();
                return;
            }
            
            var len = fs.statSync(file).size;

            var requestUri = "";
            if(zip){
                requestUri = `https://${this.publishProfile.publishUrl}/api/zip/site/wwwroot/`;
            }else{
                requestUri = `https://${this.publishProfile.publishUrl}/api/vfs/site/wwwroot/`;
            }
            
            
            if (subPath != null && subPath.length > 0)
            {
                subPath = this._stringHelper.trim(subPath, '\\\\/');
                requestUri += subPath;
            }

            this.logger.log(`[Uploading ${len} bytes to ${requestUri}]`);

            var uploadConfig = {
                url: requestUri, 
                //'proxy': 'http://127.0.0.1:8888', 
                //'rejectUnauthorized': false, 
                headers:{
                    "Content-Length": len
                }, 
                body: fs.readFileSync(file)          
            }            

            if(!zip){
                uploadConfig.headers["If-Match"] = "*";
            }

            var req = request.put(uploadConfig)                
                .auth(this.publishProfile.userName, this.publishProfile.userPWD, false);
             
            var t = "";
            
            req.on('data', async (data)=>{
                t+=data;
            })

            req.on('response', async (response)=>{
                this.logger.logGood(`[Upload ${response.statusCode}]`); 
                if(response.statusCode > 299){
                    this.logger.logWarning(`[Error ${response.statusMessage}]`);                     
                }
                
            });

            req.on('error', async(error)=>{
                this.logger.logWarning(`[Error ${error}]`); 
            })

            req.on('end', async()=>{
                this.logger.logInfo(t);
                
                good(true);               
            })  
        });
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

            this.logger.log(`[Downloading] -> ${requestUri}`);

            var req = request.get(requestUri).auth(this.publishProfile.userName, this.publishProfile.userPWD, false);        
            
            req.on('response', (res)=>{
                res.pipe(fs.createWriteStream(fTemp));
            });

             req.on('error', async (e)=>{
                this.logger.logError("[HTTPS] " + e);
                await this.cleanUp(tmpObj);
                   
                bad(false);
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