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
        var profile:string = null;

        if (argv.length === 2) {
            this._help();
            return;
        }       

        if(program.path){
             cwdPath = program.path;
        }    

        if(program.profile){
            profile = program.profile;
        }      

        if(program.folder){
            subFolder = program.folder;
        }    

        var initGood = await this._configService.init(cwdPath, profile);

        if(!initGood){
            return false;
        }

        var stayRunning: boolean = false;

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
        }

        if(program.log){
            this._kuduLogService.startLog();
            stayRunning = true;
        }

        if(program.monitor){
            this._kuduFileService.monitor();
            stayRunning = true;
        }        

        return stayRunning;
    }
    
   private _help(){
        program.help();
    }

    private _process(argv){
        program
            .version("{$version}")
            .option('-l, --log', 'output the Kudulog stream to the console')
            .option('-p, --path [functionPath]', 'the base path of your function (blank for current path)')
            .option('--profile [profilePath]', 'full path to a profile file (optional - will auto scan up for profile path if omitted)')
            .option('-m, --monitor', 'monitor the path for changes and send them up')
            .option('-g, --get', 'download the Function app ready for editing locally, works with the -f sub folder option')
            .option('-u, --upload', 'upload a folder to the server, works with the -f sub folder option')
            .option('-f, --folder [folder]', 'sub folder to get or upload, if omitted it will get or send everything under wwwroot from Kudu')
            .option('-s, --scm', 'open the Kudu Scm Site in your default browser')
            .option('-k, --key [key]', 'function key for use when calling test endpoints')
            .option('-d, --diagram [path]', 'create a diagram of the function and save it to the file parameter')
            .parse(argv);
    }
}

export {bootService};