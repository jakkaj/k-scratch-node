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


test('testFindFile', async t => {
    var basePath = path.join(__dirname, '..', '..','..','..', 'tests', 'testData');
    var pathWithFile = path.join(basePath, 'a', 'ab', 'ac');
    var pathWithNone = path.join(basePath, 'b');
       

    var bad1 = await tests.testFindFile(pathWithNone);    
    t.is(bad1, false);    
    
    var good1 = await tests.testFindFile(pathWithFile);    
    t.is(good1, true);    

    var good2 = await tests.testFindFile("tests/testData/a/ab/ac");    
    t.is(good2, true);    
    
    var bad2 = await tests.testFindFile("tests/testData/b");    
    t.is(bad2, false);

    var bad3 = await tests.testFindFile("tests/testData/a/af");    
    t.is(bad3, false);    
    

    t.pass();
})




