"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const walkerClass = require("walk");
const path = require("path");
const stringHelpers_1 = require("./stringHelpers");
class functionWalker {
    constructor(path) {
        this.path = path;
        this.walker = walkerClass.walk(path);
        this.stringHelper = new stringHelpers_1.stringHelpers();
    }
    doWalk() {
        console.log("Walking: " + this.path);
        var pusher = [];
        return new Promise((good, bad) => {
            this.walker.on("file", (root, fileStats, next) => {
                var name = path.join(root, fileStats.name);
                var folderSplit = root.split(path.sep);
                var folderName = folderSplit[folderSplit.length - 1];
                next();
                var offsetName = name.replace(this.path, '');
                offsetName = this.stringHelper.trim(offsetName, '\\\\/');
                pusher.push({ 'fullName': name, 'offsetName': offsetName });
            });
            this.walker.on("errors", function (root, nodeStatsArray, next) {
                next();
            });
            this.walker.on("end", () => {
                try {
                    good(pusher);
                }
                catch (e) {
                    bad(e);
                }
            });
        });
    }
}
exports.functionWalker = functionWalker;
//# sourceMappingURL=functionWalk.js.map