import { injectable } from 'inversify';
import * as request from 'request';

import { configBase } from "./serviceBase";
import { IFunctionTestService } from "../contract/ServiceContracts";
import { functionSettings } from "../entity/functionSettings";

@injectable()
class functionTestService extends configBase implements IFunctionTestService{
    
    private funcSettings:Array<functionSettings>;

    constructor() {
        super();
        
    }

    async getFunctionData(functionKey: string): Promise<boolean>{
        this.init();
        
        try{

            this.funcSettings = await this.getFunctionSettings();
            
            if(this.funcSettings == null){
                return false;
            }

            var count = 1;

            for(var iFunc in this.funcSettings){
                var func = this.funcSettings[iFunc];
                
                if(!func.config || !func.config.bindings){
                    continue;
                }     

                for(var iBind in func.config.bindings){
                    var binding = func.config.bindings[iBind];
                    if(binding.direction == "in" && binding.type.indexOf("Trigger")!=-1){
                        this.logger.logInfo(`   (${count}) ${func.name} [${binding.type}]`);                      
                    }
                }

                count++;                         
            }

        }catch(e){
            return false;
        }  

        return true;
    }

    async getFunctionSettings(): Promise<Array<functionSettings>>{

        return new Promise<Array<functionSettings>>((good, bad)=>{
            var siteSettings = this.getDefaultConfig();
            
            var requestUri = `https://${siteSettings.publishUrl}/api/functions`;

            var req = request.get(requestUri).auth(siteSettings.userName, siteSettings.userPWD, false);
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
                    var funcSettings:Array<functionSettings> = JSON.parse(result);
                    good(funcSettings);
                }else{
                    bad("Could not get the func settings");
                }                
            });            
        });        
    }

    /*

public async Task<List<FunctionSettings>> GetFunctionSettings()
        {            
            var siteSettings = _publishSettingsService.GetSettingsByPublishMethod(PublishMethods.MSDeploy);
            var requestUri = $"https://{siteSettings.ApiUrl}/api/functions";

            var result = await requestUri.GetAndParse<List<FunctionSettings>>(HttpHelpers.GetAuthHeadersForGoo(siteSettings));

            return result;
        }


    */
}

export {functionTestService};