import { injectable, inject } from 'inversify';
import * as request from "request";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as del from "del";
import * as admzip from "adm-zip";
import * as watch from 'watch';
import * as kuduApi from 'kudu-api';

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
               if(f.offsetName.toLowerCase().indexOf("publishsettings")!=-1){
                   continue;
               }         
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
            
            var uPath = 'site/wwwroot/';
            
            if (subPath != null && subPath.length > 0)
            {
                subPath = this._stringHelper.trim(subPath, '\\\\/');
                uPath += subPath.replace('\\', '/');
            }

            this.logger.log(`[Uploading ${len} bytes to ${uPath}]`);

            var kudu = kuduApi({
                website: this.publishProfile.msdeploySite,
                username: this.publishProfile.userName,
                password: this.publishProfile.userPWD
            });

            if(zip){
                kudu.zip.upload(file, uPath, (e)=>{
                    if(e){
                        this.logger.logError(`[Upload Zip Error] -> ${e}`)
                        bad(false);
                        return;
                    }else{         
                        this.logger.logGood("[Upload OK]")       
                        good(true);   
                    }
                });
            }else{
                var stat = fs.statSync(file);
                if(stat.isDirectory()){
                    this.logger.logWarning(`[Skip Upload Directory] -> ${file}`);
                    return;
                }
                kudu.vfs.uploadFile(file, uPath, (e)=>{
                    if(e){
                        this.logger.logError(`[Upload File Error] -> ${e}`)
                        bad(false);
                        return;
                    }else{  
                         this.logger.logGood("[Upload OK]")                        
                         good(true);   
                    }
                });
            }            
        });
    }

    async getFiles(subPath: string):Promise<boolean>{
        this.init();

        return new Promise<boolean>((good, bad)=>{
            
            var tmpFile = tmp.fileSync();            
            
            var kudu = kuduApi({
                website: this.publishProfile.msdeploySite,
                username: this.publishProfile.userName,
                password: this.publishProfile.userPWD
            });            

            var requestUri = "https://" + this.publishProfile.publishUrl + "/api/zip/site/wwwroot/";

            var dlUri = 'site/wwwroot/';

            var directPath = process.cwd();

            if (subPath != null && subPath.length > 0)
            {
                subPath = this._stringHelper.trim(subPath, '\\\\/');
                requestUri += subPath + "/";
                dlUri += subPath + "/";
                directPath = path.join(directPath, subPath);
            }

            this.logger.log(`[Downloading] -> ${requestUri}`);

            kudu.zip.download(dlUri, tmpFile.name, async (e)=>{
                if(e){
                    this.logger.logError(`[Download Error] -> ${e}`)
                    bad(false);
                    return;
                }else{
                   this.logger.logInfo("Downloaded to temp file: " + tmpFile.name);
                   var zip = new admzip(tmpFile.name);
                   zip.extractAllTo(directPath);                     
                   await del(tmpFile.name, {force:true});
                   good(true);   
                }
            })                      
            
        });

      
    } 

    async cleanUp(tmpObj){
        await del(path.join(tmpObj.name, "**"), {force:true});
    }
}

export {kuduFileService};