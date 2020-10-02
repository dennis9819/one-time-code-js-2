"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMails = void 0;
var fs = __importStar(require("fs"));
function parseMails(config) {
    return new Promise(function (resolve, reject) {
        var mailArray = [];
        var currSection = "global";
        var lineCounter = 0;
        var curCounter = 0;
        console.log("Reading mails for section " + currSection);
        var readline = require('readline'), instream = fs.createReadStream(config.inFileMail), outstream = new (require('stream'))(), rl = readline.createInterface(instream, outstream);
        rl.on('line', function (line) {
            lineCounter++;
            if (line.startsWith('[')) {
                if (line.endsWith(']')) {
                    console.log("Read " + curCounter + " adresses for section " + currSection);
                    curCounter = 0;
                    currSection = line.substring(1, line.length - 1);
                    console.log("Reading mails for section " + currSection);
                }
                else {
                    console.error("Error parsing section on line " + lineCounter + ": Syntax Error. Missing closing bracket ]");
                }
            }
            else if (!line.startsWith('#')) {
                var ix_1 = line.indexOf(";");
                if (ix_1 !== -1) {
                    if (config.force || config.usedMails.filter(function (el) { return el.mail == line.substr(0, ix_1); }).length == 0) {
                        mailArray.push({
                            mail: line.substr(0, ix_1),
                            name: line.substr(ix_1 + 1)
                        });
                        curCounter++;
                    }
                    else {
                        console.error("Skipping " + line.substr(0, ix_1) + ": Already sent");
                    }
                }
                else {
                    console.error("Error parsing mail on line " + lineCounter + ": Syntax Error. Missing ;");
                }
            }
        });
        rl.on('close', function (line) {
            console.log("Read " + curCounter + " adresses for section " + currSection + "\n" + mailArray.length + " mails read!");
            resolve(mailArray);
        });
    });
}
exports.parseMails = parseMails;
