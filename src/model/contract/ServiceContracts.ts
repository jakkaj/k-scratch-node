import { publishProfile } from "../entity/publishSettings";

interface IBootService {
    booted(process);    
}

interface IKuduLogService{
    startLog();
}

interface IKuduFileService{

}

interface IConfigService{
    init(basePath:string) : Promise<boolean>;
    getPublishProfile(profileName:string):publishProfile;
    basePath:string;
}

interface ILocalLogService{
    logError(output:string);
    logWarning(output:string);
    log(output:string);
    logGood(output:string);
    logInfo(output:string);
    logException(output:string);
}

let tContracts = {
    IBootService: Symbol("IBootService"),
    IConfigService: Symbol("IConfigService"),
    ILocalLogService: Symbol("ILocalLogService"),
    IKuduLogService: Symbol("IKuduLogService"), 
    IKuduFileService : Symbol("IKuduFileService")
}

export {IBootService, IKuduLogService, IConfigService, ILocalLogService, IKuduFileService, tContracts};