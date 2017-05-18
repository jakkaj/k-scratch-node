import { publishProfile } from "../entity/publishSettings";

interface IBootService {
    booted(process);    
}

interface IKuduLogService{
    startLog();
}

interface IKuduFileService{
    getFiles(subPath:string):Promise<boolean>;
    uploadFiles(subPath:string):Promise<boolean>;
    uploadFile(file:string, subPath:string):Promise<boolean>;
    monitor();
}

interface IConfigService{
    init(basePath:string) : Promise<boolean>;
    getPublishProfile(profileName:string):publishProfile;
    basePath:string;
    openKuduSite();
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