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
var fs = __importStar(require("fs"));
var generate_1 = require("./src/generate");
var vault_1 = require("./src/vault");
var configPath = "", action = -1, pubKey = "", privKey = "", safeFile = "", mails = "", html = "", dryrun = false, force = false;
for (var i = 1; i < process.argv.length; i++) {
    if (process.argv[i] === "--config") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            configPath = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--pubkey") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            pubKey = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--privkey") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            privKey = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--safe") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            safeFile = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--mails") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            mails = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--html") {
        if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
            html = process.argv[i + 1];
        }
        else {
            throw new Error("Invalid params");
        }
    }
    if (process.argv[i] === "--send") {
        action = 1;
    }
    if (process.argv[i] === "--decrypt") {
        action = 2;
    }
    if (process.argv[i] === "--genkey") {
        action = 3;
    }
    if (process.argv[i] === "--dryrun") {
        dryrun = true;
    }
    if (process.argv[i] === "--force") {
        force = true;
    }
}
if (action == -1) {
    throw new Error("No Action specified");
}
if (!configPath && action == 1) {
    throw new Error("Config-Path not specified");
}
if (!pubKey && action != 2) {
    throw new Error("Public-Key not specified");
}
if (!safeFile && action != 3) {
    throw new Error("Safe-file not specified");
}
if (!privKey && action >= 2) {
    throw new Error("Private-Key not specified");
}
if (!mails && action == 1) {
    throw new Error("Mail-Input not specified");
}
if (!html && action == 1) {
    throw new Error("Mail-Template not specified");
}
if (action == 1) {
    var dataSafe_1 = new vault_1.SecureVault(pubKey, privKey);
    var confRaw = fs.readFileSync(configPath, 'utf8');
    var config = {};
    var addition_1 = false;
    config = JSON.parse(confRaw);
    if (fs.existsSync(safeFile)) {
        dataSafe_1.loadData(safeFile);
        config.usedTokens = dataSafe_1.getStorage(dataSafe_1.findStorage("usedTokens")[0].u);
        config.usedMails = dataSafe_1.getStorage(dataSafe_1.findStorage("usedMails")[0].u);
        addition_1 = true;
    }
    else {
        config.usedTokens = [];
        config.usedMails = [];
    }
    try {
        config.inFileMail = mails;
        config.htmlPath = html;
        config.dryrun = dryrun;
        config.force = force;
    }
    catch (error) {
        console.error("Cannote read config file!");
        process.exit(100);
    }
    generate_1.generateToken(config, dataSafe_1).then(function (el) {
        if (addition_1) {
            dataSafe_1.setStorage(dataSafe_1.findStorage("usedTokens")[0].u, el.codes);
            dataSafe_1.setStorage(dataSafe_1.findStorage("usedMails")[0].u, el.mails);
            dataSafe_1.saveData(safeFile);
        }
        else {
            dataSafe_1.pushStorage('usedTokens', el.codes);
            dataSafe_1.pushStorage('usedMails', el.mails);
            dataSafe_1.saveData(safeFile);
        }
    }).catch(function (err) { return console.error("error", err); });
}
else if (action == 2) {
    var dataSafe = new vault_1.SecureVault(pubKey, privKey);
    dataSafe.loadData(safeFile);
    dataSafe.decryptData();
}
else if (action == 3) {
    vault_1.SecureVault.genKey(pubKey, privKey);
}
