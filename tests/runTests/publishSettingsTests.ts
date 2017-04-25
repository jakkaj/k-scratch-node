import test from 'ava';
import * as path from 'path';

import { testBase } from "../testBase";
import { IConfigService, tContracts } from "../../src/model/contract/ServiceContracts";
import { publishMethods } from "../../src/model/entity/publishSettings";


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

    async getPublishProfile(file: string, pubType:string):Promise<boolean>{
        var configService = this.resolve<IConfigService>(tContracts.IConfigService);
        var good = await configService.init(file);
        
        if(!good){
            throw 'not good in getPublishProfile';
        }

        var setting = configService.getPublishProfile(pubType);

        return setting!=null;


    }
}

var tests = new publishSettingsTest();

test('findProfile', async t=>{
    var basePath = path.join(__dirname, '..', '..','..','..', 'tests', 'testData');
    var pathWithFile = path.join(basePath, 'a', 'ab', 'ac');

    var hasProfile = await tests.getPublishProfile(pathWithFile, publishMethods.msDeploy);

    var hasNoProfile = await tests.getPublishProfile(pathWithFile, "Someotherthing");

    t.is(hasProfile, true);
    t.is(hasNoProfile, false);

});

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




