import test from 'ava';
import * as path from 'path';
import * as fs from 'fs';


import {stringHelpers} from "../../src/model/helpers/stringHelpers";
import { testBase } from "../testBase";
import { IConfigService, tContracts, IKuduFileService } from "../../src/model/contract/ServiceContracts";
import { publishMethods } from "../../src/model/entity/publishSettings";

import * as tmp from "tmp";

class fileTests extends testBase{
      /**
     *
     */
    constructor() {
        super();        
    }

    async testCreateTempFiles(){
        var kuduService = this.resolve<IKuduFileService>(tContracts.IKuduFileService);
        
        var tmp = require('tmp'); 
        var tmpobj = tmp.fileSync();
       
        console.log("File: ", tmpobj.name);
        console.log("Filedescriptor: ", tmpobj.fd);  
      
        tmpobj.removeCallback();

    }


}


var tests = new fileTests();

test('trimmer', t=>{

    var s = new stringHelpers();

    t.is(s.trim("hereisathing/", "\\\\/"), "hereisathing");  
    t.is(s.trim("hereisathing\\", "\\\\/"), "hereisathing");  
    t.is(s.trim("/hereisathing", "\\\\/"), "hereisathing");  
    t.is(s.trim("\\hereisathing/", "\\\\/"), "hereisathing");  
    t.is(s.trim("/hereisathing\\", "\\\\/"), "hereisathing");  
    t.is(s.trim("/hereisathing/", "\\\\/"), "hereisathing");  
    t.is(s.trim("hereisathing", "\\\\/"), "hereisathing");  
    
   
});

test('tempFileTests', async t=>{
  
    var tmpobj = tmp.fileSync();
    
    t.is(fs.existsSync(tmpobj.name), true);
    // If we don't need the file anymore we could manually call the removeCallback 
    // But that is not necessary if we didn't pass the keep option because the library 
    // will clean after itself. 
    tmpobj.removeCallback();

    t.is(fs.existsSync(tmpobj.name), false);
});