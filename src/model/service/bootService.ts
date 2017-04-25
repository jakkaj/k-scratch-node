import * as path from 'path';

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBootService, tContracts, IConfigService } from "../contract/ServiceContracts";
import * as program from "commander";
import { serviceBase } from "./serviceBase";

@injectable()
class bootService extends serviceBase implements IBootService {
    
    private _configService : IConfigService;

    private argv;
    
    constructor(@inject(tContracts.IConfigService) configService: IConfigService){
        super();
        this._configService = configService;
    }

    async booted(argv: any) {
        this.argv = argv;
        this._process(argv);

        var cwdPath:string = null;

        if (argv.length === 2) {
            this._help();
            return;
        }

        if(program.log){
            console.log("You logged!");
        }      

        if(program.path){
             cwdPath = program.path;
        }

        this.logger.log("Setting base path [" + cwdPath + "]");

        var initGood = await this._configService.init(cwdPath);

        return initGood;
    }

   private _help(){
        program.help();
    }

    private _process(argv){
        program
            .version("{$version}")
            .option('-l, --log', 'Output the Kudulog stream to the console')
            .option('-p, --path [functionPath]', 'The base path of your function (blank for current path)')
            .parse(argv);
    }
}

export {bootService};