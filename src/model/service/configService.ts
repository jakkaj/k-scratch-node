
import * as fs from 'fs';
import * as afs from 'async-file';
import * as path from 'path';

import * as xml2js from 'xml2js';
import { injectable, inject } from 'inversify';

import { IConfigService, tContracts, ILocalLogService } from "../contract/ServiceContracts";
import { serviceBase } from "./serviceBase";
import { publishSettings } from "../entity/publishSettings";



@injectable()
class configService extends serviceBase implements IConfigService {

    private _basePath: string = null;
    
    constructor(){
        super();
    }

    public async init(basePath:string) : Promise<boolean>{
        this._basePath = basePath;

        if(!this._validatePath(this._basePath)){
            return false;
        }

        var configFile = await this._findConfigFile(this._basePath);

        var config = await this._getPublishFile(configFile);

        var s = config.publishProfile[0].profileName;

        return true;
    }

    private _validatePath(p : string):boolean{
        var pathExists:boolean = fs.existsSync(p);
        return pathExists;
    }

    private async _findConfigFile(cwd: string):Promise<string>{
        try{

            if(!this._validatePath(cwd)){
                return null;
            }

            var files = await afs.readdir(cwd);
            
            if(files && files.length > 0){                
                for(var fNumber in files){
                    var f = files[fNumber];
                    if(f.toLowerCase().indexOf('publishsettings')!=-1){
                        return path.join(cwd, f);
                    }
                }                
            }
            
            //find parent path

            var parent = path.join(cwd, "..");
            return await this._findConfigFile(parent);            
        }catch(e){
            this.logger.logException(e);
        }

        return null;
        
    }

    private async _getPublishFile(fileName: string):Promise<publishSettings>{
        
        if(!await afs.exists(fileName)){
            this.logger.logError("Publish file could not be found/opened: " + fileName);
            return null;
        }

        var file = await afs.readFile(fileName, 'utf8');

        if(!file || file.length == 0){
             this.logger.logError("Publish file opened by is empty: " + fileName);
             return null;
        }

        var p = new Promise<publishSettings>((good, bad)=>{
                xml2js.parseString(file,(err,result) => {
                    if (err) bad(err);
                    else{

                        var profile:publishSettings = {
                            publishProfile: []
                        }

                        profile.publishProfile = result.publishData.publishProfile.map((d)=>{
                            return d.$;
                        });
                        
                        good(profile);
                    } 
            });
        });

        return p;
    }

    get basePath():string{
        return this._basePath;
    }

}

export {configService};