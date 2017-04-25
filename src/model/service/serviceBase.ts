import { injectable, inject } from 'inversify';

import { ILocalLogService, tContracts } from "../contract/ServiceContracts";

@injectable()
class serviceBase {
    
    @inject(tContracts.ILocalLogService)
    public logger:ILocalLogService;

}

export {serviceBase};