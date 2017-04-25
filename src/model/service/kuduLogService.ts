import { injectable, inject } from 'inversify';

import { IKuduLogService, tContracts, IConfigService } from "../contract/ServiceContracts";

@injectable()
class kuduLogService implements IKuduLogService {

    constructor(@inject(tContracts.IConfigService) configService : IConfigService) {
        
        
    }

    startLog(){

    }
}

export {kuduLogService};