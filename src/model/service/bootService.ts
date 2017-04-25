import * as path from 'path';

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBootService, tContracts, IConfigService, IKuduLogService } from "../contract/ServiceContracts";
import * as program from "commander";
import { serviceBase } from "./serviceBase";

@injectable()
class bootService extends serviceBase implements IBootService {
    
    private _configService : IConfigService;
    private _kuduLogService : IKuduLogService;
    private argv;
    
    constructor(
            @inject(tContracts.IConfigService) configService: IConfigService,
            @inject(tContracts.IKuduLogService) kuduLogService: IKuduLogService
        ){
        super();
        this._configService = configService;
        this._kuduLogService = kuduLogService;
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

        var initGood = await this._configService.init(cwdPath);

        if(!initGood){
            return false;
        }

        if(program.log){
            this._kuduLogService.startLog();
        }

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