interface IBootService{
    booted(process);
}

let types = {
    IBootService: Symbol("IBootService")
}

export {IBootService, types};