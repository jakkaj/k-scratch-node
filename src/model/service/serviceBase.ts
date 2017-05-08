import { injectable, inject } from 'inversify';

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


}

export {serviceBase, configBase};