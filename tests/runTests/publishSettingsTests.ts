import test from 'ava';
import * as path from 'path';

import { testBase } from "../testBase";
import { IConfigService, tContracts } from "../../src/model/contract/ServiceContracts";


class publishSettingsTest extends testBase{
    /**
     *
     */
    constructor() {
        super();        
    }

    async testFindFile(file: string):Promise<boolean>{
        var configService = this.resolve<IConfigService>(tContracts.IConfigService);
        var good = await configService.init(file);
        return good;
    }
}

var tests = new publishSettingsTest();


    // var basePath = path.join(__dirname, '..', '..','..','..', 'tests', 'testData');
    // var pathWithFile = path.join(basePath, 'a', 'ab', 'ac');
    // console.log(pathWithFile);
    // tests.testFindFile(pathWithFile).then(
    //     f =>{
    //         var t = f;
    //     }
    // )

    // process.exit();


test('testFindFile', async t => {
    var basePath = path.join(__dirname, '..', '..','..','..', 'tests', 'testData');
    var pathWithFile = path.join(basePath, 'a', 'ab', 'ac');
    var pathWithNone = path.join(basePath, 'b');
    
    var bad1 = await tests.testFindFile(pathWithNone);    
    t.is(bad1, false);    
    
    var good1 = await tests.testFindFile(pathWithFile);    
    t.is(good1, true);    

    

    t.pass();
})




