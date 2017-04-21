import "reflect-metadata";
import { Container } from "inversify"

class glue{
    public container:Container;

    constructor(){
        this.container = new Container();

        // this.container.bind<ISampleInterface>(types.ISampleInterface).to(someService);
        // this.container.bind<someOtherService>("aa").to(someOtherService);
    }    
}

export {glue};