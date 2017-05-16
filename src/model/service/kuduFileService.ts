import { injectable, inject } from 'inversify';
import * as request from "request";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as del from "del";
import * as unzip from "unzip-stream";
import * as archiver from "archiver";

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

           var archive = archiver('zip', {
                zlib: { level: 6 } // Sets the compression level.
            });

            output.on('close', async ()=> {
               output.end();
               
               // var len = archive.pointer();
               // this.logger.log('[Zipped ' + len + ' bytes]');        

                var requestUri = `https://${this.publishProfile.publishUrl}/api/zip/site/wwwroot/`;
                
                if (subPath != null && subPath.length > 0)
                {
                    subPath = this._stringHelper.trim(subPath, '\\\\/');
                    requestUri += subPath + "/";
                }

                this.logger.log(`[Uploading to ${requestUri}]`);

                var req = request.put({url: requestUri, 'proxy': 'http://127.0.0.1:8888', 'rejectUnauthorized': false}).auth(this.publishProfile.userName, this.publishProfile.userPWD, false);  
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
                    await del(tmpFile.name, {force:true});
                    good(true);               
                })
              
               
                fs.createReadStream(tmpFile.name, {start:0}).pipe(fs.createWriteStream(tmpFile.name + ".zip"));
                var fStream = fs.createReadStream(tmpFile.name);

               

              
                fStream.pipe(req);
                
            });

            archive.on('error', async (err)=> {
                 await del(tmpFile.name, {force:true});
                 this.logger.logError(`Zip error: ${err}`);
                 bad(false);
            });
            
            var w = new functionWalker(dir);       
            var files = await w.doWalk();
            this.logger.log("[Zipping]");
            
            for(var i in files){
                var f = files[i];                
               archive.append(fs.createReadStream(f.fullName), { name: f.offsetName });
            }
            archive.pipe(output);
            archive.finalize();
            
            
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