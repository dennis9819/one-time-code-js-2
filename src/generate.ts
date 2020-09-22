import * as fs from 'fs'
import * as nodemailer from 'nodemailer'; 
import { shuffleArray } from './util/shuffle';
import { mkstring } from './util/token';
import * as Handlebars from "handlebars";
import Mail from 'nodemailer/lib/mailer';
import { SecureVault } from './vault';

interface mail{
    mail: string;
    name: string;
}

export function generateToken(config: any,dataSafe: SecureVault): Promise<String[]>{
    let pr = new Promise<String[]>((resolve,error) => {
        let mailArray: mail[] = [];

        // read and process mail list
        let readline = require('readline'),
        instream = fs.createReadStream(config.inFileMail),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);
            
        rl.on('line', function (line:string) {
            console.log(line);
            mailArray.push({
                mail: line.substr(0,line.indexOf(";")),
                name: line.substr(line.indexOf(";") + 1)
            })
        });
        rl.on('close', function (line:string) {
            // next step
            generateCodes(resolve,error,mailArray,config,dataSafe);
        });
    });
    return pr;
}

// generate codes
async function generateCodes(resolve: (value?: String[]) => void,error: (reason?: any) => void,mailArray: mail[],config: any,dataSafe: SecureVault){
    let codeArray: string[] = [];
    let checkString: string = '';
    let listString: string = '';

    for(let i = 0; i < mailArray.length; i++){ // as many codes as adresses
        // check that codes are unique
        let code = mkstring(4);
        while (codeArray.includes(code)){
            code = mkstring(4);
        }
        codeArray.push(code);
        checkString = `${checkString}|${code}`
        listString = `${listString}\n${code}`
    }
    checkString = checkString.substr(1);
    listString = listString.substr(1);

    //write code lists
    try {
        fs.writeFileSync(config.outFileMatch, checkString); 
        fs.writeFileSync(config.outFileCodes, listString); 
    } catch (error) {
        error(error);
    }
    sendMails(resolve,error,mailArray,codeArray,config,dataSafe);
}


// randomize mails and tokens
async function sendMails(resolve: (value?: String[]) => void,error: (reason?: any) => void,mailArray: mail[],codeArray: string[],config: any,dataSafe: SecureVault){
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

    shuffleArray(mailArray);
    shuffleArray(codeArray);
    for(let i = 0; i < mailArray.length; i++){
        // send mail
        dataSafe.pushData({
            name: mailArray[i].name, 
            mail: mailArray[i].mail, 
            code: codeArray[i]
        })
        await send(mailArray[i].name, mailArray[i].mail, codeArray[i],template,mailserver,config);
    }
    resolve(codeArray);
}

async function send(name: string, mail: string, code: string,template: HandlebarsTemplateDelegate<any>,mailserver: Mail,config: any){
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