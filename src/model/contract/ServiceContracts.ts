interface IBootService{
    booted(process);    
}

let tContracts = {
    IBootService: Symbol("IBootService")
}

export {IBootService, tContracts};