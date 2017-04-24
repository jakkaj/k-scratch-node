import { injectable } from 'inversify';
import * as chalk from 'chalk';

import { ILocalLogService } from "../contract/ServiceContracts";

@injectable()
class localLogService implements ILocalLogService {

    private _checkThings = {
        errors: ["error", "failed"],
        good: ["succeeded"],
        warning: ["warn"],
        information: ["function completed", "reloading", "function started"]
    }

    private _errorRegular = chalk.red;
    private _errorBold = chalk.red.bold;
    private _warnRegular = chalk.yellow;
    private _warnBold = chalk.yellow.bold;
    private _infoRegular = chalk.blue;
    private _goodRegular = chalk.green;

    public log(output: string){
        if(this._check(output, this._checkThings.errors)){
            this.logError(output);
        }else if(this._check(output, this._checkThings.warning)){
            this.logWarning(output);
        }else if(this._check(output, this._checkThings.good)){
            this.logGood(output);
        }else if(this._check(output, this._checkThings.information)){
            this.logInfo(output);
        }else{
            console.log(output);
        }
    }

    public logException(output: string){
        console.log(this._errorBold("Exception: ", this._errorRegular(output)));
    }

    public logError(output: string){
        console.log(this._errorBold("Error: ", this._errorRegular(output)));
    }

    public logInfo(output: string){
        console.log(this._infoRegular(output));
    }

    public logWarning(output: string){
        console.log(this._warnBold("Error: ", this._warnRegular(output)));
    }

    public logGood(output: string){
        console.log(this._goodRegular(output));
    }

    private _check(output:string, checkThings: string[]) :boolean
    {
        var outputLower = output.toLowerCase();

        checkThings.forEach(thing =>{
            if(output.toLowerCase().indexOf(thing.toLowerCase())!=-1){
                return true;
            }
        });

        return false;
    }

}

export {localLogService};