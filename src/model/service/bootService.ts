import * as path from 'path';

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBootService, tContracts, IConfigService, IKuduLogService, IKuduFileService } from "../contract/ServiceContracts";
import * as program from "commander";
import { serviceBase } from "./serviceBase";

@injectable()
class bootService extends serviceBase implements IBootService {
    
    private _configService : IConfigService;
    private _kuduLogService : IKuduLogService;
    private _kuduFileService : IKuduFileService;
    private argv;
    
    constructor(
            @inject(tContracts.IConfigService) configService: IConfigService,
            @inject(tContracts.IKuduLogService) kuduLogService: IKuduLogService,
            @inject(tContracts.IKuduFileService) kuduFileService: IKuduFileService
        ){
        super();
        this._configService = configService;
        this._kuduLogService = kuduLogService;
        this._kuduFileService = kuduFileService;
    }

    async booted(argv: any) {
        this.argv = argv;
        this._process(argv);

        var subFolder:string = null;
        var cwdPath:string = null;

        if (argv.length === 2) {
            this._help();
            return;
        }              

        if(program.path){
             cwdPath = program.path;
        }    

        if(program.folder){
            subFolder = program.folder;
        }    

        var initGood = await this._configService.init(cwdPath);

        if(!initGood){
            return false;
        }

        if(program.get){
            var getResult = await this._kuduFileService.getFiles(subFolder);
        }

        if(program.upload){
            var uploadResult = await this._kuduFileService.uploadFiles(subFolder);
        }

        if(program.kudu){
            this._configService.openKuduSite();
        }

        if(program.log){
            this._kuduLogService.startLog();
        }

        if(program.monitor){
            this._kuduFileService.monitor();
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
            .option('-m, --monitor', 'Monitor the path for changes and send them up')
            .option('-g, --get', 'Download the Function app ready for editing locally. Works with the -f sub folder option')
            .option('-u, --upload', 'Upload a folder to the server. Works with the -f sub folder option')
            .option('-f, --folder [folder]', 'Sub folder to get or upload. If omitted it will get or send everything under wwwroot from Kudu')
            .option('-k, --kudu', 'Open the Kudu site')
            .parse(argv);
    }
}

export {bootService};