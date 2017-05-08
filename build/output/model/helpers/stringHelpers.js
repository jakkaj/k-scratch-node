"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class stringHelpers {
    trim(s, charlist) {
        s = s.replace(new RegExp("[" + charlist + "]+$"), "");
        s = s.replace(new RegExp("^[" + charlist + "]+"), "");
        return s;
    }
}
exports.stringHelpers = stringHelpers;
//# sourceMappingURL=stringHelpers.js.map