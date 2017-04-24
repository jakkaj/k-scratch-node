interface IBootService{
    booted(process);    
}

interface IConfigService{
    init(basePath:string) : Promise<boolean>;
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
    ILocalLogService: Symbol("ILocalLogService")
}

export {IBootService, IConfigService, ILocalLogService, tContracts};