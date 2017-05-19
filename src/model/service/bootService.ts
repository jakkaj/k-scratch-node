import * as path from 'path';
import * as fs from 'fs';

import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBootService, tContracts, IConfigService, IKuduLogService, IKuduFileService, IFunctionGraphService, IFunctionTestService } from "../contract/ServiceContracts";
import * as program from "commander";
import { serviceBase } from "./serviceBase";

@injectable()
class bootService extends serviceBase implements IBootService {
    
    private _configService : IConfigService;
    private _kuduLogService : IKuduLogService;
    private _kuduFileService : IKuduFileService;
    private _functionGraphService: IFunctionGraphService;
    private _functionTestService: IFunctionTestService;
    private argv;
    
    constructor(
            @inject(tContracts.IConfigService) configService: IConfigService,
            @inject(tContracts.IKuduLogService) kuduLogService: IKuduLogService,
            @inject(tContracts.IKuduFileService) kuduFileService: IKuduFileService,
            @inject(tContracts.IFunctionGraphService) functionGraphService: IFunctionGraphService,
            @inject(tContracts.IFunctionTestService) functionTestService: IFunctionTestService
        ){
        super();
        this._configService = configService;
        this._kuduLogService = kuduLogService;
        this._kuduFileService = kuduFileService;
        this._functionGraphService = functionGraphService;
        this._functionTestService = functionTestService;
    }

    async booted(argv: any) {
        this.argv = argv;
        this._process(argv);

        var subFolder:string = null;
        var cwdPath:string = null;
        var key:string = null;       

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

        if(program.scm){
            this._configService.openKuduSite();
        }

        if(program.diagram){
            if(program.diagram === true){
                this.logger.logWarning('Diagram requested, but not save path given');
            }else{
                await this._functionGraphService.buildGraph(program.diagram);
            }            
        }

        if(program.key){
            key = program.key;
            await this._functionTestService.getFunctionData(program.key);
            await this._functionTestService.runTest(7);
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
            .option('-s, --scm', 'Open the Kudu Scm Site')
            .option('-k, --key [key]', 'Function key for use when calling test endpoints')
            .option('-d, --diagram [path]', 'Create a diagram of the function and save it to the file parameter')
            .parse(argv);
    }
}

export {bootService};