import { injectable, inject } from 'inversify';

import { ILocalLogService, tContracts, IConfigService } from "../contract/ServiceContracts";

@injectable()
class serviceBase {
    
    @inject(tContracts.ILocalLogService)
    public logger:ILocalLogService;
}

@injectable()
class configBase extends serviceBase {
    
    @inject(tContracts.IConfigService)
    public configService: IConfigService;
}

export {serviceBase, configBase};