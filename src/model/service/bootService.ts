import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBootService } from "../contract/ServiceContracts";
import * as program from "commander";

@injectable()
class bootService implements IBootService {
    
    private argv;
    
    async booted(argv: any) {
        this.argv = argv;
        this._process(argv);

        if (argv.length === 2) {
            this._help();
            return;
        }

        if(program.log){
            console.log("You logged!");
        }

        

      
    }

   private _help(){
        program.help();
    }

    private _process(argv){
        program
            .version("{$version}")
            .option('-l, --log', 'Output the Kudulog stream to the console')
            .parse(argv);
    }
}

export {bootService};