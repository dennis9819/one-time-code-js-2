import * as fs from 'fs'
import { generateToken } from './src/generate'
import { SecureVault } from './src/vault'

let configPath = "", action = -1, pubKey = "", privKey = "", safeFile = "", mails = "", html = "";
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
    try {
        config = JSON.parse(confRaw)
        config.inFileMail = mails;
        config.htmlPath = html;
    } catch (error) {
        console.error("Cannote read config file!")
        process.exit(100);
    }
    generateToken(config,dataSafe).then(el =>  {
        console.log(el)
        dataSafe.saveData(safeFile);
    }).catch(err => console.error("error", err))
}else if(action == 2){
    let dataSafe: SecureVault = new SecureVault(pubKey,privKey);
    dataSafe.loadData(safeFile);
    dataSafe.decryptData();
}else if(action == 3){
    SecureVault.genKey(pubKey,privKey);
}


