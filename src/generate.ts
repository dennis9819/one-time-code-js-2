/**
 * Dennis Gunia (c) 2020
 *
 * Generator Implementation.
 * This File provides the implementation of the code generator and mail sending functionality.
 * 
 *
 * @summary Generator Implementation.
 * @author Dennis Gunia <info@dennisgunia.de>
 * @license Licensed under the Apache License, Version 2.0 (the "License").
 * 
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as nodemailer from 'nodemailer'; 
import * as cliProgress from 'cli-progress'

import * as Handlebars from "handlebars";
import Mail from 'nodemailer/lib/mailer';
import { SVault } from './vault';
import { MLParser } from './mailParser';
import { shuffleArray } from './util/shuffle';
import { delay, mkstringCN } from './util/misc';

/**
 * Namespace containing the code for Generating the Code and delivering the mails
 */
export namespace MLGenerator {
    
    /**
     * Interface used to Return codes and mails form the main Function {@link generateToken}
     */
    export interface MLGenReturn{
        /** List of generated codes */
        codes: string[];
        /** List of processed mails */
        mails: MLParser.MLItem[];
    }
    
    /**
     * Main function used to generate and deliver codes
     * @param config Main configuration object
     * @param dataSafe Main safe used for logging and storing data
     * @returns used codes and processed mails
     */
    export function generateToken(config: any,dataSafe: SVault.SecureVault): Promise<MLGenReturn>{
        return new Promise<MLGenReturn>((resolve,error) => {
            MLParser.parseMails(config, dataSafe).then(res => {
                // next step
                generateCodes(resolve,error,res,config,dataSafe);
            })
        });
    }
    
    /**
     * Generate the same amout of codes as distinct mail adresses and stores them to the list file 
     * This function also includes previously used tokens to prevent duplicate tokens.
     * Rejects if matchfile cannot be saved.
     * @internal
     * @param resolve Callback to resolve promise 
     * @param error Callback to reject promise 
     * @param mailArray list of mail adresses
     * @param config Main configuration object
     * This Function uses the following variables:
     *   usedTokens -> List of previosly used tokens
     *   outFileMatch -> Path to match file
     * @param dataSafe Main safe used for logging and storing data
     */
    async function generateCodes(resolve: (value?: MLGenReturn) => void,error: (reason?: any) => void,mailArray: MLParser.MLItem[],config: any,dataSafe: SVault.SecureVault){
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
                code = mkstringCN(4);
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
        // next
        sendMails(resolve,error,mailArray,codeArray,config,dataSafe);
    }
    
    
    /**
     * Reads template file and compiles template.
     * Iterate through mails and codes, randomly assign code to mail and send mail to recipient.
     * If dryrun is enabled, mails will not be sent and new mails won't be included in return.
     * Rejects if template cannot be read.
     * @internal
     * @param resolve Callback to resolve promise 
     * @param error Callback to reject promise 
     * @param mailArray list of mail adresses
     * @param codeArray list of generated codes
     * @param config Main configuration object
     * This Function uses the following variables:
     *   htmlPath -> Path to html template
     *   dryrun -> Boolean value. If true no mails will be sent and list won't be updated.
     *   force -> Boolean value. If true all mails are resent.
     *   usedTokens -> Array of Strings. Specifies already used tokens adresses.
     *   usedMails -> Array of Strings. Specifies already served mail adresses.
     *   mail -> mailserver settings
     * @param dataSafe Main safe used for logging and storing data
     */
    async function sendMails(resolve: (value?: MLGenReturn) => void,error: (reason?: any) => void,mailArray: MLParser.MLItem[],codeArray: string[],config: any,dataSafe: SVault.SecureVault){
        let mailserver = nodemailer.createTransport(config.mail);
        // read mail template and compile
        let template!: HandlebarsTemplateDelegate<any>;
        try {
            const htmlSrc=fs.readFileSync(config.htmlPath, "utf8")
            template = Handlebars.compile(htmlSrc)
        } catch (error) {
            console.error("Cannote read template file!")
            error(error);
        }
    
        // send mails
        console.log("\nSending mails")
        const pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        pbar.start(mailArray.length, 0,{
            speed: "N/A"
        });
        let position = 0;
    
        // randomize arrays
        shuffleArray(mailArray);
        shuffleArray(codeArray);
        if (config.force){dataSafe.clearVault();}
        for(let i = 0; i < mailArray.length; i++){
            // send mail
            dataSafe.writeTransaction(`process: ${mailArray[i].mail}`);
            if (!config.dryrun){
                dataSafe.pushData({
                    name: mailArray[i].name, 
                    mail: mailArray[i].mail, 
                    code: codeArray[i]
                })
            }
            await send(mailArray[i].name, mailArray[i].mail, codeArray[i],template,mailserver,config,dataSafe);
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
    
    /**
     * Reads template file and compiles template.
     * Iterate through mails and codes, randomly assign code to mail and send mail to recipient.
     * If dryrun is enabled, mails will not be sent and new mails won't be included in return.
     * Rejects if template cannot be read.
     * @internal
     * @param name Name of recpipient 
     * @param mail Mail of recpipient 
     * @param code Code of recpipient 
     * @param template compiled mail template
     * @param mailserver Mailserver settings
     * @param config Main configuration object
     * This Function uses the following variables:
     *   mail.auth.user -> sender mail adress
     *   mailFrom -> sender mail ailas
     *   dryrun -> Boolean value. If true no mails will be sent.
     * @param dataSafe Main safe used for logging and storing data
     */
    async function send(name: string, mail: string, code: string,template: HandlebarsTemplateDelegate<any>,mailserver: Mail,config: any,dataSafe: SVault.SecureVault){
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
                dataSafe.writeTransaction(` -> mail sent`);
            } catch (error) {
                console.log(`Error sendign mail to ${mail} : ${error}`)
                dataSafe.writeTransaction(` -> mail failed : ${error}`);
            }
        }
    }
}

