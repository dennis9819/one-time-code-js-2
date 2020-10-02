import { rejects } from "assert";
import * as fs from 'fs'
import { Console } from "console";

export interface MLItem{
    mail: string;
    name: string;
}

export function parseMails(config: any) {
    return new Promise<MLItem[]>((resolve,reject) => {
        let mailArray: MLItem[] = [];
        let currSection: string = "global";
        let lineCounter: number = 0;
        let curCounter: number = 0;


        console.log(`Reading mails for section ${currSection}`)
        // read and process mail list
        let readline = require('readline'),
        instream = fs.createReadStream(config.inFileMail),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);
            
        rl.on('line', function (line:string) {
            lineCounter ++;
            if(line.startsWith('[')){
                if(line.endsWith(']')){
                    console.log(`Read ${curCounter} adresses for section ${currSection}`)
                    curCounter = 0;
                    currSection=line.substring(1,line.length -1);
                    console.log(`Reading mails for section ${currSection}`)
                }else{
                    console.error(`Error parsing section on line ${lineCounter}: Syntax Error. Missing closing bracket ]`)
                }
            }else if (!line.startsWith('#')){
                const ix = line.indexOf(";")
                if (ix !== -1){
                    // check if already exist
                    if (config.force || config.usedMails.filter((el: MLItem) => el.mail == line.substr(0,ix)).length == 0){
                        mailArray.push({
                            mail: line.substr(0,ix),
                            name: line.substr(ix + 1)
                        })
                        curCounter ++;
                    }else{
                        console.error(`Skipping ${line.substr(0,ix)}: Already sent`)
                    }
                }else{
                    console.error(`Error parsing mail on line ${lineCounter}: Syntax Error. Missing ;`)
                }

            } 
        });
        rl.on('close', function (line:string) {
            // next step
            console.log(`Read ${curCounter} adresses for section ${currSection}\n${mailArray.length} mails read!`)
            resolve(mailArray);
        });

    })
}

