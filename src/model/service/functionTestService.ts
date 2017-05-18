import { injectable } from 'inversify';
import * as request from 'request';

import { configBase } from "./serviceBase";
import { IFunctionTestService } from "../contract/ServiceContracts";
import { functionSettings, binding, testDataConfig } from "../entity/functionSettings";
import { publishSettings, publishProfile } from "../entity/publishSettings";



@injectable()
class functionTestService extends configBase implements IFunctionTestService{
    
    private funcSettings:Array<functionSettings>;
    private settingsMatch:[functionSettings, binding][];
    private key:string;

    constructor() {
        super();
        this.settingsMatch = [];
    }

    async runTest(testNumber: number):Promise<boolean>{
        
        return new Promise<boolean>(async (good, bad)=>{
            if(!this.settingsMatch){
                this.logger.logError("No settings found to run remote testing");
                bad(false);
            }

            if(this.settingsMatch.length < testNumber){
                
                this.logger.logWarning("Setting number is out of range");
                bad(false);            
            }
            
            var setting = this.settingsMatch[testNumber-1];

            var siteSettings = this.getDefaultConfig();

            if(setting[1].type == "httpTrigger"){
                
                var confRaw = setting[0].test_data == "" ? "{}" : setting[0].test_data;
                
                var conf:testDataConfig = JSON.parse(confRaw);

                var urlBase = `${siteSettings.destinationAppUrl}/api/${setting[0].name}?`;

                if(conf.queryStringParams){
                    for(var iQs in conf.queryStringParams){
                        var qs = conf.queryStringParams[iQs];
                        urlBase += `${encodeURI(qs.name)}=${encodeURI(qs.value)}&`;
                    }                    
                }

                try{
                    var key = await this.getKey(siteSettings, setting[0]);
                    urlBase += `code=${key}`;
                }catch(e){
                    this.logger.log("There was a problem getting the function admin key");
                    bad(false);
                }

                
            }else{

            }


        });
    }

    private async getKey(siteSettings:publishProfile, functionSettings:functionSettings):Promise<string>{
        var requestUri = `${siteSettings.destinationAppUrl.replace("http", "https")}/admin/functions/${functionSettings.name}/keys`;
        
        var headers = {'x-functions-key': this.key};

        var result = await this.get(requestUri, {headers:headers});

        return result;

        
    }

    async getFunctionData(functionKey: string): Promise<boolean>{
        this.init();
        this.key = functionKey;

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
                        this.settingsMatch.push([func, binding]);                    
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

        return new Promise<Array<functionSettings>>(async (good, bad)=>{
            var siteSettings = this.getDefaultConfig();
            
            var requestUri = `https://${siteSettings.publishUrl}/api/functions`;

            try{
                var result = await this.get(requestUri);
                var funcSettings:Array<functionSettings> = JSON.parse(result);
                good(funcSettings);
            }catch(e){
                bad(false);
            }
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