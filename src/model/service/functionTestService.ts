import { injectable } from 'inversify';
import * as request from 'async-request';

import { configBase } from "./serviceBase";
import { IFunctionTestSettings } from "../contract/ServiceContracts";

@injectable()
class functionTestSettings extends configBase implements IFunctionTestSettings{
    
    constructor() {
        super();
        
    }

    async getFunctionData(functionKey: string) : boolean{
        this.init();
        
        var result = await request.get
    }

    async getFunctionSettings():Promise<functionSettings>{

        var siteSettings = this.getDefaultConfig();
        var requestUri = `https://${siteSettings.publishUrl}/api/functions`;

        var result = await request.get(requestUri).auth(siteSettings.userName, siteSettings.userPWD, false);

        var funcSettings:functionSettings = JSON.parse(result);

        return funcSettings;
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