import { injectable, inject } from 'inversify';

import { ILocalLogService, tContracts } from "../contract/ServiceContracts";

@injectable()
class serviceBase {
    
    @inject(tContracts.ILocalLogService)
    protected logger:ILocalLogService;

}

export {serviceBase};