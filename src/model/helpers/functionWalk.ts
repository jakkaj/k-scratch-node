"use strict";

import * as walkerClass from "walk";
import * as path from "path";
import * as fs from "fs";

import {stringHelpers} from "./stringHelpers";

class functionWalker{
    private path:string;
    private walker:any;
    private stringHelper:any;
    constructor(path:string){
        this.path = path;
        this.walker = walkerClass.walk(path);
        this.stringHelper = new stringHelpers();       
    }

    public doWalk():Promise<Array<any>>{         

            console.log("Walking: " + this.path);

            var pusher:Array<{}> = [];
            
            return new Promise((good, bad) => {
            
                this.walker.on("file", (root, fileStats, next) => {
                    
                    var name = path.join(root, fileStats.name);
                    var folderSplit = root.split(path.sep);
                    var folderName = folderSplit[folderSplit.length - 1];

                    next();

                    var offsetName = name.replace(this.path, '')
                    offsetName = this.stringHelper.trim(offsetName, '\\\\/');
                    pusher.push({'fullName': name, 'offsetName':offsetName});
                });

                this.walker.on("errors", function (root, nodeStatsArray, next) {
                    next();
                });
        
                this.walker.on("end",  () => {
                    try{
                        good(pusher);
                    }catch (e) {
                        bad(e);
                    }
                    
                });
            });
        }
    }

export {functionWalker};