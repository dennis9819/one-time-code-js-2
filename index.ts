import * as fs from 'fs'
import { generateToken } from './src/generate'
import { SecureVault } from './src/vault'
import { exit } from 'process';

let configPath = "", action = -1, pubKey = "", privKey = "", safeFile = "", mails = "", html = "", dryrun = false, force = false;
// parse cli args
for (let i = 1; i < process.argv.length ; i++){
    if (process.argv[i] === "--config"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            configPath = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--pubkey"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            pubKey = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--privkey"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            privKey = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--safe"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            safeFile = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--mails"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            mails = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--html"){
        if (i + 1 < process.argv.length && !process.argv[i+1].startsWith("--")){
            html = process.argv[i+1];
        }else {throw new Error("Invalid params")}
    }
    if (process.argv[i] === "--send"){ action = 1 }
    if (process.argv[i] === "--decrypt"){ action = 2 }
    if (process.argv[i] === "--genkey"){ action = 3 }
    if (process.argv[i] === "--dryrun"){ dryrun = true }
    if (process.argv[i] === "--force"){ force = true }
}
if ( action == -1){ throw new Error("No Action specified") }
if (!configPath &&  action == 1){ throw new Error("Config-Path not specified") }
if (!pubKey &&  action != 2){ throw new Error("Public-Key not specified") }
if (!safeFile &&  action != 3){ throw new Error("Safe-file not specified") }
if (!privKey &&  action >= 2){ throw new Error("Private-Key not specified") }
if (!mails &&  action == 1){ throw new Error("Mail-Input not specified") }
if (!html &&  action == 1){ throw new Error("Mail-Template not specified") }



if (action == 1){
    let dataSafe: SecureVault = new SecureVault(pubKey,privKey);
    // load config 
    const confRaw = fs.readFileSync(configPath, 'utf8')
    let config:any = {}
    let addition: boolean = false; // wenn nur weitere hinzugefügt werden
    config = JSON.parse(confRaw)
    // load safe if present
    if (fs.existsSync(safeFile)){
        dataSafe.loadData(safeFile);
        config.usedTokens = dataSafe.getStorage(dataSafe.findStorage("usedTokens")[0].u);
        config.usedMails = dataSafe.getStorage(dataSafe.findStorage("usedMails")[0].u);
        addition = true;
    }else{
        config.usedTokens = [];
        config.usedMails = [];
    }

    try {
        config.inFileMail = mails;
        config.htmlPath = html;
        config.dryrun = dryrun;
        config.force = force;
    } catch (error) {
        console.error("Cannote read config file!")
        process.exit(100);
    }
    generateToken(config,dataSafe).then(el =>  {
        if (addition){
            dataSafe.setStorage(dataSafe.findStorage("usedTokens")[0].u,el.codes)
            dataSafe.setStorage(dataSafe.findStorage("usedMails")[0].u,el.mails)
            dataSafe.saveData(safeFile);
        }else{
            dataSafe.pushStorage('usedTokens',el.codes)
            dataSafe.pushStorage('usedMails',el.mails)
            dataSafe.saveData(safeFile);
        }

    }).catch(err => console.error("error", err))
}else if(action == 2){
    let dataSafe: SecureVault = new SecureVault(pubKey,privKey);
    dataSafe.loadData(safeFile);
    dataSafe.decryptData();
}else if(action == 3){
    SecureVault.genKey(pubKey,privKey);
}


