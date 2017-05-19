import { injectable, inject } from 'inversify';
import * as request from 'request';

import { ILocalLogService, tContracts, IConfigService } from "../contract/ServiceContracts";
import { publishProfile, publishMethods } from "../entity/publishSettings";

@injectable()
class serviceBase {
    
    @inject(tContracts.ILocalLogService)
    public logger:ILocalLogService;
}

@injectable()
class configBase extends serviceBase {
    
    @inject(tContracts.IConfigService)
    public configService: IConfigService;

    public publishProfile:publishProfile = null;

    public init(){
        if(this.publishProfile == null){
            this.publishProfile = this.getDefaultConfig();
        }        
    }

    public getDefaultConfig():publishProfile{
        
        var p = this.configService.getPublishProfile(publishMethods.msDeploy);

         if(p == null){
             this.logger.logError('Publish method was not found ' + publishMethods.msDeploy);
             throw 'Publish method was not found ' + publishMethods.msDeploy;
         }    

         return p;
    }

    //TODO: These get methods should really be on an injected class, for now they are here. 
    
    public async getAndParse<T>(requestUri:string, config?:{}):Promise<T>{
        var result = await this.get(requestUri, config);

        if(!result || result.length == 0){
            return null;
        }

        var obj:T = JSON.parse(result);

        return obj;
    }

    public async get(requestUri:string, config?:{}):Promise<string>{
        
        var siteSettings = this.getDefaultConfig();        
        if(!config){
            config = {};
        }
        return new Promise<string>((good, bad)=>{
            var req = request.get(requestUri, config).auth(siteSettings.userName, siteSettings.userPWD, false);
            var result:string = "";
            var isGood:boolean = false;

            req.on('data', async (data)=>{
                result+=data;
            });

            req.on('response', async (response)=>{                
                if(response.statusCode > 299){
                    this.logger.logWarning(`[Error ${response.statusMessage}]`);                     
                }else{
                    isGood = true;
                }                
            });

            req.on('end', ()=>{
                if(isGood){                   
                    good(result);
                }else{
                    bad("Could not get the func settings");
                }                
            });
        });
            
    }


}

export {serviceBase, configBase};