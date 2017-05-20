import { functionKey, nameValuePair } from './../entity/functionSettings';
import { injectable } from 'inversify';
import * as request from 'request';
import * as linq from 'linq-es2015';


import { configBase } from "./serviceBase";
import { IFunctionTestService } from "../contract/ServiceContracts";
import { functionSettings, binding, testDataConfig, key } from "../entity/functionSettings";
import { publishSettings, publishProfile } from "../entity/publishSettings";



@injectable()
class functionTestService extends configBase implements IFunctionTestService{
    
    private funcSettings:Array<functionSettings>;
    private settingsMatch:[functionSettings, binding][];
    private key:string;
    private runKey:string = null;
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
                    await this.doGet(urlBase, conf.method, conf.headers, conf.body);
                }catch(e){
                    this.logger.log("There was a problem getting the function admin key");
                    bad(false);
                }                
            }else{
                var urlBase = `${siteSettings.destinationAppUrl}/admin/functions/${setting[0].name}`;
                urlBase = urlBase.replace('http', 'https');
                var headers = new Array<nameValuePair>();              
                headers.push({name:'x-functions-key', value:this.key});
                
                var post = JSON.stringify({'input':setting[0].test_data});
                try{
                    this.doGet(urlBase, 'POST', headers, post);
                }catch(e){
                    this.logger.log("There was a problem executing the remote function");
                    bad(false);
                }
            }
            good(true);
        });
    }

    private async doGet(url:string, method:string, headers:Array<nameValuePair>, body:string) : Promise<boolean>{
        var siteSettings:publishProfile = this.getDefaultConfig();

        var h = {'Content-Type': 'application/json'};

        if(headers){            
            headers.forEach((c:nameValuePair)=>{
                h[c.name] = c.value;
            });
        }        

        var config = {
            method:method.toLocaleUpperCase(), 
            uri: url, 
            body: body, 
            headers:h,
            // 'proxy': 'http://127.0.0.1:8888', 
            // 'rejectUnauthorized': false, 

        }

        return new Promise<boolean>((good, bad)=>{
            var req = request(config).auth(siteSettings.userName, siteSettings.userPWD, false);

            var t = "";
            
            req.on('data', async (data)=>{
                t+=data;
            })

            req.on('response', async (response)=>{                
                if(response.statusCode >= 200 && response.statusCode < 300){
                    this.logger.logGood(`[Remote] -> ${response.statusCode}`);                     
                }else{
                    this.logger.logError(`[Remote] -> ${response.statusCode}`);                     
                } 
                                
            });

            req.on('end', ()=>{
                this.logger.log(t);
                good(true);
            });
        });        
    }

    private async getKey(siteSettings:publishProfile, functionSettings:functionSettings):Promise<string>{
        if(this.runKey != null){
            return this.runKey;
        }
        
        var requestUri = `${siteSettings.destinationAppUrl.replace("http", "https")}/admin/functions/${functionSettings.name}/keys`;
        
        var headers = {'x-functions-key': this.key};

        var result = await this.getAndParse<functionKey>(requestUri, {headers:headers});
        
        var key:key = linq.asEnumerable(result.keys).FirstOrDefault(_=>_.name == "default");

        if(!key){
            return null;
        }

        this.runKey = key.value;

        return key.value;        
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