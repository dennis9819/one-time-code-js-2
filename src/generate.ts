import * as fs from 'fs'
import * as path from 'path'
import * as nodemailer from 'nodemailer'; 
import * as cliProgress from 'cli-progress'
import { shuffleArray } from './util/shuffle';
import { mkstring } from './util/token';
import * as Handlebars from "handlebars";
import Mail from 'nodemailer/lib/mailer';
import { SecureVault } from './vault';
import { parseMails } from './mailParser';

interface mail{
    mail: string;
    name: string;
}

export interface genReturn{
    codes: string[];
    mails: mail[];
}

export function generateToken(config: any,dataSafe: SecureVault): Promise<genReturn>{
    return new Promise<genReturn>((resolve,error) => {
        parseMails(config).then(res => {
            generateCodes(resolve,error,res,config,dataSafe);
        })
    });
}

// generate codes
async function generateCodes(resolve: (value?: genReturn) => void,error: (reason?: any) => void,mailArray: mail[],config: any,dataSafe: SecureVault){
    console.log("\nGenerating codes")
    const pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    pbar.start(mailArray.length, 0,{
        speed: "N/A"
    });
    let position = 0;

    let codeArray: string[] = [];
    let checkString: string = '';

    for(let i = 0; i < mailArray.length; i++){ // as many codes as adresses
        // check that codes are unique
        let code = '';
        do{
            code = mkstring(4);
        }while ( (config.force ? codeArray : [...codeArray, ...config.usedTokens]).includes(code))
        codeArray.push(code);
        checkString = `${checkString}|${code}`
        position ++;
        pbar.update(position);
    }
    checkString = checkString.substr(1);
    pbar.stop();
    //write code lists
    try {
        if (!fs.existsSync(path.dirname(config.outFileMatch))){
            fs.mkdirSync(path.dirname(config.outFileMatch));
        }
        fs.writeFileSync(config.outFileMatch, checkString); 
    } catch (err) {
        
        error(err);
    }
    sendMails(resolve,error,mailArray,codeArray,config,dataSafe);
}


// randomize mails and tokens
async function sendMails(resolve: (value?: genReturn) => void,error: (reason?: any) => void,mailArray: mail[],codeArray: string[],config: any,dataSafe: SecureVault){
    let mailserver = nodemailer.createTransport(config.mail);
    // read mail template
    let template!: HandlebarsTemplateDelegate<any>;
    try {
        const htmlSrc=fs.readFileSync(config.htmlPath, "utf8")
        template = Handlebars.compile(htmlSrc)
    } catch (error) {
        console.error("Cannote read template file!")
        error(error);
    }

    console.log("\nSending mails")
    const pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    pbar.start(mailArray.length, 0,{
        speed: "N/A"
    });
    let position = 0;

    shuffleArray(mailArray);
    shuffleArray(codeArray);
    if (config.force){dataSafe.clearVault();}
    for(let i = 0; i < mailArray.length; i++){
        // send mail
        if (!config.dryrun){
            dataSafe.pushData({
                name: mailArray[i].name, 
                mail: mailArray[i].mail, 
                code: codeArray[i]
            })
        }
        await send(mailArray[i].name, mailArray[i].mail, codeArray[i],template,mailserver,config);
        position ++;
        pbar.update(position);
    }
    pbar.stop();
    shuffleArray(mailArray);
    shuffleArray(codeArray);
    shuffleArray(mailArray);
    shuffleArray(codeArray);
    resolve({
        codes: config.force ? codeArray : (config.dryrun ? config.usedTokens : [...codeArray, ...config.usedTokens]),
        mails: config.force ? mailArray : (config.dryrun ? config.usedMails : [...mailArray, ...config.usedMails])
    });

}

async function send(name: string, mail: string, code: string,template: HandlebarsTemplateDelegate<any>,mailserver: Mail,config: any){
    if (config.dryrun){
        await delay(100);
        console.log(`\n\x1b[36m -> dryrun: would send to ${mail}\x1b[0m`); 
    }else{
        // fill template
        let html = template({
            "name": name,
            "mail": mail,
            "code": code
        })
        let mailOptions = {
            from: `${config.mailFrom} <${config.mail.auth.user}>`, // sender address
            to: mail, // list of receivers
            subject: `Dein Zugangscode zur BJR Wahl`, // Subject line
            html: html
        };
        try {
            await mailserver.sendMail(mailOptions);
        } catch (error) {
            console.log(`Error sendign mail to ${mail} : ${error}`)
        }
    }
}

function delay(t: number, val?: number) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }